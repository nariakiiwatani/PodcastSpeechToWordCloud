import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
				value={[range.min, range.max]}
				pushable={1}
				draggableTrack
				onChange={handleChange}
			/>
		</div>
		<div>
			<span>{`min:${range.min}, max:${range.max}`}</span>
		</div>
	</>);
}

type FilterType = 'length' | 'freq'
const WordRangeFilter = (prop:{
	type: FilterType,
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	const filterHook = useMemo(() => {
		switch(prop.type) {
			case 'length':
				return useLengthFilter
			case 'freq':
				return useFreqFilter
		}
	}, [prop.type])
	const { allowed, bounds, range, setRange } = filterHook(prop.words)
	const prev_bounds = useRef<Range>(bounds)
	useEffect(() => {
		const bounds_diff = {
			min: bounds.min - prev_bounds.current!.min,
			max: bounds.max - prev_bounds.current!.max
		}
		const new_range = {
			min: range.min + bounds_diff.min,
			max: range.max + bounds_diff.max
		}
		if (new_range.min > new_range.max) {
			[new_range.min, new_range.max] = [new_range.max, new_range.min]
		}
		[new_range.min, new_range.max] = [
			Math.max(new_range.min, bounds.min),
			Math.min(new_range.max, bounds.max)
		]
		setRange(new_range)
		return () => {
			prev_bounds.current = bounds
		}
	}, [bounds])
	useEffect(() => {
		prop.onResult(allowed)
	}, [allowed, prop.onResult])
	return (<>
		<div>
			<p>{prop.type} filter</p>
			<RangeSlider bounds={bounds} range={range} setRange={setRange}/>
		</div>
	</>);
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
	const updateFunctinos = useMemo(() => {
		return filterTypes.map((type, i) => {
			return (value:boolean[]) => updateAllowed(i, value)
		})
	}, [filterTypes])
	return (<>
		{filterTypes.map((filterType,index) => (
			<WordRangeFilter
				key={index}
				type={filterType}
				words={words}
				onResult={updateFunctinos[index]}
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
	const [filterTypes, setFilterTypes] = React.useState<FilterType[]>(['length', 'freq']);
	const [allowed, setAllowed] = React.useState<boolean[]>([]);
	const [classFilter, setClassFilter] = React.useState<string[]>(['*']);
	const updateClassFilter = React.useCallback((result:Map<string,boolean>) => {
		setClassFilter([...result.entries()].filter(([,v]) => v).map(([k]) => k))
	}, [setClassFilter])
	useEffect(() => {
		// const filterdWords = words
		// .filter(useTokenizer ? ({pos}) => classFilter.includes(pos) : ()=>true)
		// .filter(({word})=>word.length>=lengthFilter.min && word.length<=lengthFilter.max)
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
		{/* <div style={{display: useTokenizer?'block':'none'}}>
			<WordClassFilter
				words={words.filter(({pos})=>pos!=='*')}
				default_value={false}
				onResult={updateClassFilter}
			/>
		</div> */}
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