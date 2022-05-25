import React from 'react';
import Wordcloud from 'react-d3-cloud';
import {tokenize, getTokenizer} from "kuromojin";

getTokenizer({dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict"})

const words2freq = (words: string[]) => {
	const freq: { [word: string]: number } = {};
	words.forEach(word => {
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
const MyWordcloud = ({text}:{text:string}) => {
	const [useTokenizer, setUseTokenizer] = React.useState(false);
	const [data, setData] = React.useState<{
		text: string;
		value: number;
	}[]>([]);
	React.useEffect(() => {
		const doSync = (words:string[]) => {
			const freq = words2freq(words);
			const arr = freq2array(freq, f=>f*100);
			setData(arr);
		}
		const doAsync = async () => {
			tokenize(text.replace(/\s/g, ''))
			.then(res => {
				const words = res.filter(r => ["名詞","動詞","形容詞","副詞"].indexOf(r.pos) >= 0).map(r => r.basic_form);
				return words
			})
			.then(doSync)
		}
		if(useTokenizer) {
			doAsync()
		}
		else {
			doSync(text.split(' '))
		}
	}, [text, useTokenizer])
	return (<>
		<input type='checkbox'
			checked={useTokenizer}
			onChange={(e) => setUseTokenizer(e.target.checked)}
			name='useTokenizer'
		/>
		<label htmlFor='useTokenizer'>use tokenizer</label>
		<Wordcloud
			data={data}
		/>
	</>);
}

export default MyWordcloud