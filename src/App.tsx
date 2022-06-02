import { useState, useCallback } from 'react';
import { Tokenizer, NoTokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import WordFilters from './components/WordFilters';

function App() {
	const [text, setText] = useState('')
	const addText = useCallback((text: string) => {
		setText(prev=>[prev,text].join('\n'))
	}, [setText])
	const [useTokenizer, setUseTokenizer] = useState(true)
	const [tokens, setTokens] = useState<Word[]>([])
	const [words, setWords] = useState<string[]>([])
	const handleFilter = useCallback((allowed: boolean[]) => {
		setWords(tokens.filter((_, i) => allowed[i]).map(token => token.word))
	}, [tokens]);
	return (
		<div className={styles.app}>
			<div className={styles.editor}>
				<div>
					<Speech2Text onSentence={addText} onError={console.error} />
				</div>
				<div>
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</div>
				<div>
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
				</div>
				<WordFilters
					className={styles.editorItem}
					filterTypes={useTokenizer
						? ['class', 'length', 'freq']
						: ['length', 'freq']}
					words={tokens}
					onResult={handleFilter}
				/>
			</div>
			<div className={styles.preview}>
				<MyWordCloud words={words} />
			</div>
		</div>
	);
}

export default App;

const styles = {
	app : `
	flex
	flex-row
	gap-4
	border-2
	`,
	editor : `
	flex
	flex-col
	gap-4
	p-2
	m-2
	border-2
	`,
	editorItem : `
	flex-none
	`,
	preview : `
	flex-1
	p-2
	m-2
	border-2
	`
}