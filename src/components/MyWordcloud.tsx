import React from 'react';
import Wordcloud from 'react-d3-cloud';
import {tokenize, getTokenizer} from "kuromojin";
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';

getTokenizer({dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict"})

type Word = {
	word: string,
	pos: string,
}
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
const WordLengthFilter = (prop:{
	words: Word[],
	onResult:(result:{min:number,max:number})=>void
}) => {
	const {words, onResult} = prop
	const [minBound, setMinBound] = React.useState(1)
	const [maxBound, setMaxBound] = React.useState(10)
	const [min, setMin] = React.useState(minBound)
	const [max, setMax] = React.useState(maxBound)
	const words2 = words.map(w=>w)
	React.useEffect(() => {
		setMinBound(Math.min(...words.map(({word}) => word.length)))
		setMaxBound(Math.max(...words.map(({word}) => word.length)))
	}, [words2])
	const handleChange = React.useCallback(([min, max]) => {
		setMin(min)
		setMax(max)
		onResult({min, max})
	}, [onResult])
	return (<>
		<div>
			length filter
			<span>{minBound}</span>
			<Slider range
				allowCross={false}
				min={minBound}
				max={maxBound}
				defaultValue={[minBound, maxBound]}
				draggableTrack
				onChange={handleChange}
			/>
			<span>{maxBound}</span>
		</div>
		<div>
			<span>{`min:${min}, max:${max}`}</span>
		</div>
	</>);
}
const WordFreqFilter = (prop:{
	words: Word[],
	onResult:(result:{min:number,max:number})=>void
}) => {
	const {words, onResult} = prop
	const [minBound, setMinBound] = React.useState(1)
	const [maxBound, setMaxBound] = React.useState(10)
	const [min, setMin] = React.useState(minBound)
	const [max, setMax] = React.useState(maxBound)
	const words2 = words.map(w=>w)
	React.useEffect(() => {
		const freq = words2freq(words2)
		setMinBound(Math.min(...freq.values()))
		setMaxBound(Math.max(...freq.values()))
	}, [words2])
	const handleChange = React.useCallback(([min, max]) => {
		setMin(min)
		setMax(max)
		onResult({min, max})
	}, [onResult])
	return (<>
		<div>
			freq filter
			<span>{minBound}</span>
			<Slider range
				allowCross={false}
				min={minBound}
				max={maxBound}
				defaultValue={[minBound, maxBound]}
				draggableTrack
				onChange={handleChange}
			/>
			<span>{maxBound}</span>
		</div>
		<div>
			<span>{`min:${min}, max:${max}`}
			</span>
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
	const [classFilter, setClassFilter] = React.useState<string[]>(['*']);
	const updateClassFilter = React.useCallback((result:Map<string,boolean>) => {
		setClassFilter([...result.entries()].filter(([,v]) => v).map(([k]) => k))
	}, [setClassFilter])
	const [lengthFilter, setLengthFilter] = React.useState<{min:number,max:number}>({min:1,max:10})
	const [freqFilter, setFreqFilter] = React.useState<{min:number,max:number}>({min:1,max:10})
	React.useEffect(() => {
		const filterdWords = words
		.filter(useTokenizer ? ({pos}) => classFilter.includes(pos) : ()=>true)
		.filter(({word})=>word.length>=lengthFilter.min && word.length<=lengthFilter.max)

		const freq:WordFreqMap = words2freq(filterdWords);
		[...freq.entries()]
		.filter(([,v]) => v<freqFilter.min || v>freqFilter.max)
		.forEach(([k,v]) => freq.delete(k))
		
		setData(freq2array(freq, f=>f*100))
	}, [words, classFilter, lengthFilter, freqFilter, useTokenizer])
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
			setWords(text.replace(/\s/g, '\n').split('\n').map(w => ({word: w, pos: '*'})))
		}
	}, [text, useTokenizer])
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
		<WordLengthFilter
			words={words}
			onResult={setLengthFilter}
		/>
		<WordFreqFilter
			words={words}
			onResult={setFreqFilter}
		/>
		<Wordcloud
			data={data}
		/>
	</>);
}

export default MyWordcloud