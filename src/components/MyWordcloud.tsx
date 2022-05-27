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

const words2freq = (words: Word[]) => {
	const freq: { [word: string]: number } = {};
	words.forEach(({word}) => {
		if (freq[word]) {
			freq[word]++;
		} else {
			freq[word] = 1;
		}
	});
	return freq;
}
const freq2array = (freq: { [word: string]: number }, freq_map:(f:number)=>number=(f=>f)) => {
	const arr: { text: string, value: number }[] = [];
	for (const word in freq) {
		arr.push({ text: word, value: freq_map(freq[word]) });
	}
	return arr;
}

const WordClassFilter = (prop:{
	classes: string[],
	default_value:boolean,
	onResult:(result:Map<string,boolean>)=>void
}) => {
	const {classes, default_value, onResult} = prop
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
			const count = new Map<string,number>()
			classes.forEach(c => {
				if (count.has(c)) {
					count.set(c, count.get(c) + 1)
				} else {
					count.set(c, 1)
				}
			})
			return count
		})
	}, [classes])
	React.useEffect(() => {
		setFilter(filter => {
			const map = new Map<string,boolean>(filter)
			classes.forEach(c => {
				if(!map.has(c)) {
					map.set(c, default_value)
				}
			})
			return map
		})
	}, [classes])
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
	words: string[],
	onResult:(result:{min:number,max:number})=>void
}) => {
	const {words, onResult} = prop
	const [minBound, setMinBound] = React.useState(1)
	const [maxBound, setMaxBound] = React.useState(10)
	const [min, setMin] = React.useState(minBound)
	const [max, setMax] = React.useState(maxBound)
	React.useEffect(() => {
		setMinBound(Math.min(...words.map(w => w.length)))
		setMaxBound(Math.max(...words.map(w => w.length)))
	}, [words.length])
	const handleChange = React.useCallback(([min, max]) => {
		setMin(min)
		setMax(max)
		onResult({min, max})
	}, [onResult])
	return (<>
		<div>
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
	React.useEffect(() => {

	}, [words])
	React.useEffect(() => {
		const filterdWords = words
		.filter(useTokenizer ? ({pos}) => classFilter.includes(pos) : ()=>true)
		.filter(({word})=>word.length>=lengthFilter.min && word.length<=lengthFilter.max)
		setData(freq2array(words2freq(filterdWords), f=>f*100))
	}, [useTokenizer, classFilter, lengthFilter, words])
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
			setWords(text.split(' ').map(w => ({word: w, pos: '*'})))
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
				classes={words.filter(({pos})=>pos!=='*').map(w => w.pos)}
				default_value={false}
				onResult={updateClassFilter}
			/>
		</div>
		<WordLengthFilter
			words={words.map(w => w.word)}
			onResult={setLengthFilter}
		/>
		<Wordcloud
			data={data}
		/>
	</>);
}

export default MyWordcloud