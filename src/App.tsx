import { useState, useCallback, useRef } from 'react';
import { Tokenizer, NoTokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import WordFilters from './components/WordFilters';
import EditBackground from './components/EditBackground';
import DownloadElement from './components/DownloadElement';
import { useFontList } from './libs/FontList';
import EditSize2d from './components/EditSize';

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
	const [font, setFont] = useState('sans-serif')
	const fontList = useFontList(font)
	const [sizeOffset, setSizeOffset] = useState(0)
	const [sizeMult, setSizeMult] = useState(100)
	const sizeMapFunction = useCallback((value: number) => {
		return value * sizeMult + sizeOffset
	}, [sizeMult, sizeOffset])
	const captureElement = useRef<HTMLDivElement>(null)
	const [autoUpdate, setAutoUpdate] = useState(true)
	const [imageSize, setImageSize] = useState([512,512])
	const handleChangeImageSize = useCallback((width: number, height: number) => {
		setImageSize([width, height])
	}, [setImageSize])
	const handleRotateFuncChange = useCallback((rotateFunc: (word: Word) => number) => {
	}, [])
	return (
		<div className={styles.app}>
			<div className={styles.wordEditor}>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>音声ファイルを選択</p>
					<Speech2Text onSentence={addText} onError={console.error} />
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>文字起こし結果</p>
					<textarea
						className={styles.border}
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder='直接入力もできます'
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
						? ['class', 'length', 'freq', 'words']
						: ['length', 'freq', 'words']}
					words={tokens}
					onResult={handleFilter}
				/>
			</div>
			<div className={styles.canvasEditor}>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>フォント</p>
					<select
						className={styles.border}
						value={font}
						onChange={(e) => setFont(e.target.value)}
					>
						{fontList.map(font => (
							<option key={font} value={font}>{font}</option>
						))}
					</select>
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>文字サイズ</p>
					<div>
						<label htmlFor='sizeOffset'>{`オフセット(${sizeOffset})`}</label>
						<br />
						<input
							type='range'
							min='0'
							max='1000'
							value={sizeOffset}
							onChange={(e) => setSizeOffset(parseInt(e.target.value))}
							name='sizeOffset'
						/>
					</div>
					<div>
						<label htmlFor='sizeMult'>{`倍率(${sizeMult})`}</label>
						<br />
						<input
							type='range'
							min='1'
							max='1000'
							value={sizeMult}
							onChange={(e) => setSizeMult(parseInt(e.target.value))}
							name='sizeMult'
						/>
					</div>
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>背景を設定</p>
					<EditBackground
						element={captureElement}
					/>
				</div>
				<div className={styles.editorItem}>
					<p className={styles.heading3}>画像サイズ</p>
					<EditSize2d 
						width={imageSize[0]}
						height={imageSize[1]}
						onChange={handleChangeImageSize}
					/>
				</div>
				<div className={styles.editorItem}>
					<DownloadElement
						src={captureElement}
						width={imageSize[0]}
						height={imageSize[1]}
					>
						<button className={styles.downloadButton}>画像保存</button>
					</DownloadElement>
				</div>
			</div>
			<div className={styles.preview}>
				<p className={styles.heading3}>プレビュー</p>
				<input
					type='checkbox'
					checked={autoUpdate}
					onChange={(e) => setAutoUpdate(e.target.checked)}
					name='autoUpdate'
				/>
				<label htmlFor='autoUpdate'>自動更新</label>
				<MyWordCloud
					autoUpdate={autoUpdate}	
					drawRef={captureElement}
					width={imageSize[0]}
					height={imageSize[1]}
					words={words}
					font={font}
					valueMap={sizeMapFunction}
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
	m-1
	border-2
	`,
	editorItem : `
	flex-none
	p-2
	pb-8
	border-b-2
	`,
	canvasEditor : `
	flex
	flex-col
	basis-1/6
	gap-4
	p-2
	m-1
	border-2
	`,
	preview : `
	flex-1
	p-2
	m-1
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
	p-2
	items-center
	border-2
	`,
}