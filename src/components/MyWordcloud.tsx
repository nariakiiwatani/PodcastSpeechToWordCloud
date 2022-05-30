import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Wordcloud from 'react-d3-cloud';
import {tokenize, getTokenizer} from "kuromojin";
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';
import { Word } from '../libs/Words';
import { useFreqFilter, useLengthFilter } from '../libs/WordFilter';

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

const WordClassFilter = (prop:{
	words: Word[],
	default_value:boolean,
	onResult:(result:Map<string,boolean>)=>void
}) => {
	const {words, default_value, onResult} = prop
	const [filter, setFilter] = React.useState(new Map<string,boolean>())
	const [count, setCount] = React.useState(new Map<string,number>())
	const updateFilter = React.useCallback((pos:string, value:boolean) => {
		const new_filter = new Map<string,boolean>(filter)
		new_filter.set(pos, value)
		setFilter(new_filter)
		onResult(new_filter)
	}, [filter, onResult])
	
	React.useEffect(() => {
		setCount(() => {
			const sorted = new Map<string,Set<string>>()
			words.forEach(({word,pos}) => {
				if (sorted.has(pos)) {
					sorted.get(pos).add(word)
				} else {
					sorted.set(pos, new Set([word]))
				}
			})
			const count = new Map<string,number>()
			sorted.forEach((set, pos) => {
				count.set(pos, set.size)
			})
			return count
		})
	}, [words])
	React.useEffect(() => {
		setFilter(filter => {
			const map = new Map<string,boolean>(filter)
			words.forEach(({pos}) => {
				if(!map.has(pos)) {
					map.set(pos, default_value)
				}
			})
			return map
		})
	}, [words])
	return(<>
		{[...count.entries()].filter(([k,v])=>v>0).map(([k,v]) => <label key={k}>
			<input type="checkbox"
				checked={filter.get(k)}
				onChange={e => updateFilter(k, e.target.checked)}
			/>
			{`${k} (${count.get(k)})`}
		</label>)}
	</>)
}

type Range = {
	min:number,
	max:number
}
type RangeSliderProps = {
	bounds:Range,
	range:Range,
	setRange:(range:Range)=>void
}
const RangeSlider = ({
	bounds, range, setRange
}:RangeSliderProps) => {
	const handleChange = React.useCallback(([min, max]) => {
		setRange({min, max})
	}, [setRange])
	return (<>
		<div>
			<span>{`bounds:(${bounds.min}, ${bounds.max})`}</span>
			<Slider range
				allowCross={true}
				min={bounds.min}
				max={bounds.max}
				defaultValue={[range.min, range.max]}
				draggableTrack
				onChange={handleChange}
			/>
		</div>
		<div>
			<span>{`min:${range.min}, max:${range.max}`}</span>
		</div>
	</>);
}

type FilterName = 'length' | 'freq'
const WordRangeFilter = (prop:{
	type: FilterName,
	words: Word[],
	onResult:(words: Word[])=>void
}) => {
	const filterHook = useMemo(() => {
		switch(prop.type) {
			case 'length':
				return useLengthFilter
			case 'freq':
				return useFreqFilter
		}
	}, [prop.type])
	const { words:filteredWords, bounds, range, setRange } = filterHook(prop.words)
	useEffect(() => {
		prop.onResult(filteredWords)
	}, [filteredWords, prop.onResult])
	return (<>
		<div>
			<p>{prop.type} filter</p>
			<RangeSlider bounds={bounds} range={range} setRange={setRange}/>
		</div>
	</>);
}

const MyWordcloud = ({text}:{text:string}) => {
	const [useTokenizer, setUseTokenizer] = React.useState(false);
	const [data, setData] = React.useState<{
		text: string;
		value: number;
	}[]>([]);
	const [words, setWords] = React.useState<Word[]>([]);

	const [filteredWords, setFilteredWords] = React.useState<Word[]>([]);	
	const [classFilter, setClassFilter] = React.useState<string[]>(['*']);
	const updateClassFilter = React.useCallback((result:Map<string,boolean>) => {
		setClassFilter([...result.entries()].filter(([,v]) => v).map(([k]) => k))
	}, [setClassFilter])
	useEffect(() => {
		// const filterdWords = words
		// .filter(useTokenizer ? ({pos}) => classFilter.includes(pos) : ()=>true)
		// .filter(({word})=>word.length>=lengthFilter.min && word.length<=lengthFilter.max)

		const freq:WordFreqMap = words2freq(filteredWords);
		setData(freq2array(freq, f=>f*100))
	}, [filteredWords])
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

	const handleFreqFilterResult = useCallback((newWords:Word[]) => {
		setFilteredWords(newWords)
	}, [words])
	return (<>
		<input type='checkbox'
			checked={useTokenizer}
			onChange={(e) => setUseTokenizer(e.target.checked)}
			name='useTokenizer'
		/>
		<label htmlFor='useTokenizer'>use tokenizer</label>
		<div style={{display: useTokenizer?'block':'none'}}>
			<WordClassFilter
				words={words.filter(({pos})=>pos!=='*')}
				default_value={false}
				onResult={updateClassFilter}
			/>
		</div>
		{/* <WordLengthFilter
			words={words}
			onResult={setLengthFilter}
		/> */}
		<WordRangeFilter
			type='freq'
			words={words}
			onResult={handleFreqFilterResult}
		/>
		<Wordcloud
			data={data}
		/>
	</>);
}

export default MyWordcloud