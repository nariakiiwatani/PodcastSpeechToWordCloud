import { useState, useMemo, useEffect, useRef } from 'react'
import { Word, ScoredWord, calcWordFreq } from './Words';
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

export type FilterType = 'length' | 'freq' | 'class' | 'words'

const minmax = (value:number[], default_min:number, default_max:number=default_min) => {
	return value.length===0
	? {min:default_min, max:default_max}
	: {
		min: Math.min(...value),
		max: Math.max(...value)
	}
}

const useRangeFilterImpl = (words:ScoredWord[], type: FilterType) => {
	const bounds = useMemo(() => minmax(words.map(w=>w.score), 1), [words])
	const rangeAtom = useMemo(() => atomWithStorage(`range-${type}`, undefined), [])
	const [range, setRange] = useAtom(rangeAtom)
	const validRange = useMemo(() => {
		if(range === undefined) return bounds
		return range.min > bounds.max || range.max < bounds.min ? bounds : range
	}, [range, bounds])
	const allowed = useMemo<boolean[]>(() => {
		return words.map((findWord:Word, index:number) => {
			const found = words.find(({word,pos}) => {
				return findWord.word === word && findWord.pos === pos
			})
			return found !== undefined && found.score >= validRange.min && found.score <= validRange.max
		})
	}, [words, validRange])
	const scoreCounts = useMemo(() => {
		const unique = new Map<number,Word[]>()
		words.forEach(({word,pos,score}) => {
			if(unique.has(score)) {
				const found = unique.get(score)
				if(!found.find(w => w.word === word && w.pos === pos)) {
					found.push({word,pos})
				}
			} else {
				unique.set(score, [{word,pos}])
			}
		})
		return unique
	}, [words])

	
	return {
		scoreCounts,
		allowed,
		bounds,
		range: validRange,
		setRange
	}
}

const calcFreq = (words:Word[]) => {
	const freq = calcWordFreq(words)
	return words.map(w=> {
		const found = freq.find(f=>f.word===w.word && f.pos===w.pos)
		const score = found !== undefined ? found.score : 0
		return {
			...w,
			score
		}
	})
}
const calcLength = (words:Word[]) => {
	return words.map(w=> {
		return {
			...w,
			score: w.word.length
		}
	})
}
const calcScore = (words:Word[], type:FilterType):ScoredWord[] => {
	switch(type) {
		case 'freq':
			return calcFreq(words)
		case 'length':
			return calcLength(words)
		default:
			return words.map(w=> ({...w, score: 0}))
	}
}

export const useRangeFilter = (words:Word[], type:FilterType) => {
	const scored = useMemo(() => calcScore(words, type), [words])
	return useRangeFilterImpl(scored, type)
}

export const useFreqFilter = (words:Word[]) => {
	return useRangeFilter(words, 'freq')
}

export const useLengthFilter = (words:Word[]) => {
	return useRangeFilter(words, 'length')
}

export const useClassFilter = (words:Word[], allowedClass: string[]) => {
	const classCounts = useMemo(() => {
		// count unique word classes
		const unique = new Map<string,Word[]>()
		words.forEach(({word,pos}) => {
			if(unique.has(pos)) {
				const found = unique.get(pos)
				if(!found.find(w => w.word === word)) {
					found.push({word,pos})
				}
			} else {
				unique.set(pos, [{word,pos}])
			}
		})
		return unique
	}, [words])
	const allClasses = useRef<Set<string>>()
	useEffect(() => {
		if(!allClasses.current) {
			allClasses.current = new Set()
		}
		Array.from(classCounts.keys()).forEach(c=>allClasses.current.add(c))
	}, [classCounts])
	const allowed = useMemo(() => {
		return words.map((w:Word) => {
			return allowedClass.includes(w.pos)
		})
	}, [words, allowedClass])
	return {
		classCounts,
		allowed,
	}
}

export const useDenyFilter = (words:Word[]) => {
	const [allowed, setAllowed] = useState<boolean[]>(words.map(()=>true))
	const [denyWords, setDenyWords] = useState<string[]>([])
	useEffect(() => {
		setAllowed(words.map(w=>!denyWords.includes(w.word)))
	}, [words, denyWords])
	return {
		allowed,
		denyWords,
		setDenyWords
	}
}
