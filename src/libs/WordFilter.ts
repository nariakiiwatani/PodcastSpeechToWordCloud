import { useState, useMemo, useEffect, useRef } from 'react'
import { Word, ScoredWord, calcWordFreq } from './Words';

export type FilterType = 'length' | 'freq' | 'class'

const minmax = (value:number[], default_min:number, default_max:number=default_min) => {
	return value.length===0
	? {min:default_min, max:default_max}
	: {
		min: Math.min(...value),
		max: Math.max(...value)
	}
}

const useRangeFilter = (words:ScoredWord[]) => {
	const bounds = useMemo(() => minmax(words.map(w=>w.score), 1), [words])
	const [range, setRange] = useState(bounds)
	const allowed = useMemo<boolean[]>(() => {
		return words.map((findWord:Word, index:number) => {
			const found = words.find(({word,pos}) => {
				return findWord.word === word && findWord.pos === pos
			})
			return found !== undefined && found.score >= range.min && found.score <= range.max
		})
	}, [words, range])
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
		range,
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

export const useFreqFilter = (words:Word[]) => {
	const scored = useMemo(() => calcFreq(words), [words])
	return useRangeFilter(scored)
}

export const useLengthFilter = (words:Word[]) => {
	const scored = useMemo(() => calcLength(words), [words])
	return useRangeFilter(scored)
}

export const useWordFilter = (words:Word[], type:FilterType) => {
	const scored = useMemo(() => calcScore(words, type), [words])
	return useRangeFilter(scored)
}

export const useClassFilter = (words:Word[]) => {
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
	const [allowedClass, setAllowedClass] = useState<string[]>(Array.from(classCounts.keys()))
	const allClasses = useRef<Set<string>>()
	useEffect(() => {
		if(!allClasses.current) {
			allClasses.current = new Set()
		}
		const newClasses = Array.from(classCounts.keys())
		.filter(c=>!allClasses.current.has(c))
		setAllowedClass([...allowedClass, ...newClasses])
		newClasses.forEach(c=>allClasses.current.add(c))
	}, [classCounts])
	const allowed = useMemo(() => {
		return words.map((w:Word) => {
			return allowedClass.includes(w.pos)
		})
	}, [words, allowedClass])
	return {
		classCounts,
		allowed,
		allowedClass,
		setAllowedClass
	}
}