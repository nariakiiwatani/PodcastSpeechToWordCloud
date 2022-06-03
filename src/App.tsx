import { useState, useCallback, useRef } from 'react';
import { Tokenizer, NoTokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import WordFilters from './components/WordFilters';
import html2canvas from 'html2canvas';
import EditBackground from './components/EditBackground';

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
	const captureElement = useRef<HTMLDivElement>(null)
	const handleCapture = useCallback(async () => {
		if(!captureElement?.current) {
			return
		}
		await html2canvas(captureElement.current)
		.then(canvas => {
			document.body.appendChild(canvas);
		})
	}, [captureElement?.current])

	return (
		<div className={styles.app}>
			<div className={styles.wordEditor}>
				<div className={styles.editorItem}>
					<Speech2Text onSentence={addText} onError={console.error} />
				</div>
				<div className={styles.editorItem}>
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</div>
				<div className={styles.editorItem}>
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
			<div className={styles.canvasEditor}>
				<div className={styles.editorItem}>
					<EditBackground
						element={captureElement}
					/>
				</div>
				<div className={styles.editorItem}>
					<button onClick={handleCapture}>capture</button>
				</div>
			</div>
			<div className={styles.preview}>
				<MyWordCloud
					drawRef={captureElement}
					words={words}
				/>
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
	wordEditor : `
	flex
	flex-col
	basis-1/6
	gap-4
	p-2
	m-2
	border-2
	`,
	editorItem : `
	flex-none
	`,
	canvasEditor : `
	flex
	flex-col
	basis-1/6
	gap-4
	p-2
	m-2
	border-2
	`,
	preview : `
	flex-1
	p-2
	m-2
	border-2
	`
}