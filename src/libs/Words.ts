
export interface Word {
	word: string;
	pos: string;
}

export interface WordFreq {
	word: Word;
	value: number;
}

export const calcWordFreq = (words: Word[]): WordFreq[] => {
	const freq = new Array<WordFreq>();
	words.forEach(word => {
		const found = freq.find(({word:w}) => w.word === word.word && w.pos === word.pos)
		if(found) {
			found.value++;
		} else {
			freq.push({word, value: 1});
		}
	})
	return freq;
}