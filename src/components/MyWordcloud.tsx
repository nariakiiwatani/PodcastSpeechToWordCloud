import React from 'react';
import Wordcloud from 'react-d3-cloud';

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
	const data = React.useMemo(() => {
		const words = text.split(/\s+/).filter(word => word.length > 0);
		const freq = words2freq(words)
		const arr = freq2array(freq, (f)=>f*f*100)
		return arr
	}, [text])
	return (
		<Wordcloud
			data={data}
		/>
	);
}

export default MyWordcloud