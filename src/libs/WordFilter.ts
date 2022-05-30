import { useState, useMemo } from 'react'
import { Word, WordFreq, calcWordFreq } from './Words';

type Range = { min:number, max:number }

const calcFreqBounds = (words:Word[]) => {
	const freq:WordFreq[] = calcWordFreq(words)
	const bounds:Range = freq.length === 0
	? {min:1,max:1}
	: {
		min: Math.min(...freq.map(f=>f.value)),
		max: Math.max(...freq.map(f=>f.value))
	}
	return { freq, bounds }
}

export const useFreqFilter = (words:Word[]) => {
	const { freq, bounds } = useMemo(() => calcFreqBounds(words), [words])
	const [range, setRange] = useState(bounds)
	const filterFunc = useMemo(() => (findWord:Word) => {
		const found = freq.find(({word:{word,pos}}:WordFreq) => {
			return findWord.word === word && findWord.pos === pos
		})
		return found !== undefined && found.value >= range.min && found.value <= range.max
	}, [freq, range])
	const filteredWords = useMemo(() => words.filter(filterFunc), [words, filterFunc])
	return {
		words:filteredWords,
		bounds,
		range,
		setRange
	}
}
