import { useState, useCallback } from 'react';
import './App.css';
import { Tokenizer, NoTokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import WordFilters from './components/WordFilters';

function App() {
	const [text, setText] = useState('')
	const [useTokenizer, setUseTokenizer] = useState(true)
	const [tokens, setTokens] = useState<Word[]>([])
	const [words, setWords] = useState<string[]>([])
	const handleFilter = useCallback((allowed: boolean[]) => {
		setWords(tokens.filter((_, i) => allowed[i]).map(token => token.word))
	}, [tokens]);
	return (
		<div className="App">
			<Speech2Text onResult={setText} onError={console.error} />
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<input
				type='checkbox'
				checked={useTokenizer}
				onChange={(e) => setUseTokenizer(e.target.checked)}
				name='useTokenizer'
			/>
			<label htmlFor='useTokenizer'>トークナイザーを使用する</label>
			{useTokenizer
				? <Tokenizer text={text} onResult={setTokens} />
				: <NoTokenizer text={text} onResult={setTokens} />
			}
			<WordFilters
				filterTypes={useTokenizer
					? ['class', 'length', 'freq']
					: ['length', 'freq']}
				words={tokens}
				onResult={handleFilter}
			/>
			<MyWordCloud words={words} />
		</div>
	);
}

export default App;
