import { useState, useCallback, useRef } from 'react';
import { Tokenizer, NoTokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import WordFilters from './components/WordFilters';
import html2canvas from 'html2canvas';
import EditBackground from './components/EditBackground';
import DownloadElement from './components/DownloadElement';

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

	return (
		<div className={styles.app}>
			<div className={styles.wordEditor}>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>音声ファイルを選択</p>
					<Speech2Text onSentence={addText} onError={console.error} />
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>直接入力もできます</p>
					<textarea
						className={styles.border}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>形態素解析を使用</p>
					<input
						type='checkbox'
						checked={useTokenizer}
						onChange={(e) => setUseTokenizer(e.target.checked)}
						name='useTokenizer'
					/>
					<label htmlFor='useTokenizer'>有効/無効</label>
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
					<p className={styles.heading3}>背景を設定</p>
					<EditBackground
						element={captureElement}
					/>
				</div>
				<div className={styles.editorItem}>
					<DownloadElement
						src={captureElement}
					>
					<button
						className={styles.downloadButton}
					>
						画像保存
					</button>
					</DownloadElement>
				</div>
			</div>
			<div className={styles.preview}>
				<p className={styles.heading3}>プレビュー</p>
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
	p-4
	pb-8
	border-b-2
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
	`,
	heading3 : `
	text-xl
	text-slate-600
	font-semibold
	`,
	border : `
	border-2
	border-slate-600
	`,
	downloadButton : `
	text-xl
	text-slate-600
	font-semibold
	rounded-xl
	p-4
	items-center
	border-2
	`,
}