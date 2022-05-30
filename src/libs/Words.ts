
export interface Word {
	word: string;
	pos: string;
}

export interface ScoredWord extends Word {
	score: number;
}

export const calcWordFreq = (words: Word[]): ScoredWord[] => {
	const freq = new Array<ScoredWord>();
	words.forEach(word => {
		const found = freq.find(w => w.word === word.word && w.pos === word.pos)
		if(found) {
			found.score++;
		} else {
			freq.push({...word, score: 1});
		}
	})
	return freq;
}