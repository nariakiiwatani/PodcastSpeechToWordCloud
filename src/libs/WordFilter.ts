import { useState, useMemo } from 'react'
import { Word, ScoredWord, calcWordFreq } from './Words';

const minmax = (value:number[], default_min:number, default_max:number=default_min) => {
	return value.length===0
	? {min:default_min, max:default_max}
	: {
		min: Math.min(...value),
		max: Math.max(...value)
	}
}

const useWordFilter = (words:ScoredWord[]) => {
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
	// count unique words by score
	const scoreCounts = useMemo(() => {
		const unique = new Map<number,number>()
		const already = new Array<Word>()
		words.forEach(({word,pos,score}) => {
			if(already.find((w) => w.word === word && w.pos === pos)) {
				return;
			}
			already.push({word,pos})
			if(unique.has(score)) {
				unique.set(score, unique.get(score)!+1)
			} else {
				unique.set(score, 1)
			}
		})
		return unique
	}, [words])
	
	// const scoreCounts:Map<number,number> = useMemo(() => 
	// 	words.reduce((counts, word) => {
	// 		const current = counts.get(word.score) || 0
	// 		counts.set(word.score, current+1)
	// 		return counts
	// 	}, new Map<number,number>())
	// , [words])
	return {
		scoreCounts,
		allowed,
		bounds,
		range,
		setRange
	}
}

export const useFreqFilter = (words:Word[]) => {
	const scored = useMemo(() => {
		const freq = calcWordFreq(words)
		return words.map(w=> {
			const found = freq.find(f=>f.word===w.word && f.pos===w.pos)
			const score = found !== undefined ? found.score : 0
			return {
				...w,
				score
			}
		})
	}, [words])
	return useWordFilter(scored)
}

export const useLengthFilter = (words:Word[]) => {
	const scored = useMemo(() => {
		return words.map(w=> {
			return {
				...w,
				score: w.word.length
			}
		})
	}, [words])
	return useWordFilter(scored)
}
