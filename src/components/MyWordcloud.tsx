import React, { useState, useRef, useMemo, useEffect, useCallback, ReactNode } from 'react';
import Wordcloud from 'react-d3-cloud';
import {tokenize, getTokenizer} from "kuromojin";
import { Word } from '../libs/Words';
import { FilterType } from "../libs/WordFilter"
import { WordLengthRangeFilter, WordFreqRangeFilter } from './WordRangeFilter';
import { WordClassFilter } from './WordClassFilter';

getTokenizer({dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict"})

type WordFreqMap = Map<string, number>

const words2freq = (words: Word[]) => {
	const freq: WordFreqMap = new Map();
	words.forEach(({word}) => {
		if (freq.has(word)) {
			freq.set(word, freq.get(word)! + 1)
				
		} else {
			freq.set(word, 1)
		}
	});
	return freq;
}
const freq2array = (freq: WordFreqMap, freq_map:(f:number)=>number=(f=>f)) => {
	const arr: { text: string, value: number }[] = [];
	freq.forEach((value, key) => {
		arr.push({
			text: key,
			value: freq_map(value)
		})
	})
	return arr;
}

const WordFilter = (prop:{
	words: Word[],
	type: FilterType,
	onResult:(allowed: boolean[])=>void
}) => {
	const {words, type, onResult} = prop
	return (
	type === 'length' ?
		<WordLengthRangeFilter
			words={words}
			onResult={onResult}
		/> : 
	type === 'freq' ? 
		<WordFreqRangeFilter
			words={words}
			onResult={onResult}
		/> : 
	type === 'class' ? 
		<WordClassFilter
			words={words}
			onResult={onResult}
		/> : 
	<></>)
}


const WordFilters = (prop:{
	words: Word[],
	filterTypes: FilterType[],
	onResult:(allowed: boolean[])=>void
}) => {
	const {words, filterTypes, onResult} = prop
	const initAllowed = useCallback(length => new Array<boolean[]>(length).fill(new Array<boolean>(words.length)), [words])
	const [allowed, setAllowed] = useState<boolean[][]>(() => initAllowed(filterTypes.length))
	useEffect(() => {
		if(allowed.length !== filterTypes.length) {
			setAllowed(initAllowed(filterTypes.length))
		}
	}, [filterTypes])
	const updateAllowed = useCallback((index:number, value:boolean[]) => {
		setAllowed(prev => {
			return initAllowed(allowed.length)
			.map((v, i) => i === index ? [...value] : [...prev[i]])
		})
	}, [allowed])
	useEffect(() => {
		onResult(allowed.reduce(
			(acc, v) => acc.map((a, i) => a && v[i]),
			new Array<boolean>(allowed[0].length).fill(true)
		))
	}, [allowed, onResult])
	const updateFunctions = useMemo(() => {
		return filterTypes.map((type, i) => {
			return (value:boolean[]) => updateAllowed(i, value)
		})
	}, [filterTypes])
	return (<>
		{filterTypes.map((filterType,index) => (
			<WordFilter
				key={index}
				type={filterType}
				words={words}
				onResult={updateFunctions[index]}
			/>))}
	</>)
}
const MyWordcloud = ({text}:{text:string}) => {
	const [useTokenizer, setUseTokenizer] = React.useState(false);
	const [data, setData] = React.useState<{
		text: string;
		value: number;
	}[]>([]);
	const [words, setWords] = React.useState<Word[]>([]);
	const [filterTypes, setFilterTypes] = React.useState<FilterType[]>(['class', 'length', 'freq']);
	const [allowed, setAllowed] = React.useState<boolean[]>([]);
	useEffect(() => {
		const filteredWords = words.filter((_,i)=>allowed[i])
		const freq:WordFreqMap = words2freq(filteredWords);
		setData(freq2array(freq, f=>f*100))
	}, [allowed])
	React.useEffect(() => {
		const doTokenize = async () => {
			tokenize(text.replace(/\s/g, ''))
			.then(res => {
				const words = res.map(r => ({
					word: r.basic_form,
					pos: r.pos
				}));
				return words
			})
			.then(setWords)
		}
		if(useTokenizer) {
			doTokenize()
		}
		else {
			setWords(text.replace(/\s/g, '\n').split('\n').filter(t=>t.length).map(w => ({word: w, pos: '*'})))
		}
	}, [text, useTokenizer])

	return (<>
		<input type='checkbox'
			checked={useTokenizer}
			onChange={(e) => setUseTokenizer(e.target.checked)}
			name='useTokenizer'
		/>
		<label htmlFor='useTokenizer'>use tokenizer</label>
		<WordFilters
			words={words}
			filterTypes={filterTypes}
			onResult={setAllowed}
		/>
		<Wordcloud
			data={data}
			width={512}
			height={512}
		/>
	</>);
}

export default MyWordcloud