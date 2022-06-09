import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Tokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import { WordClassFilter } from './components/WordClassFilter'
import { WordLengthRangeFilter, WordFreqRangeFilter } from './components/WordRangeFilter'
import { WordDenyFilter } from './components/WordDenyFilter'
import EditBackground from './components/EditBackground';
import DownloadElement from './components/DownloadElement';
import { useFontList } from './libs/FontList';
import EditSize2d from './components/EditSize';
import EditMask from './components/EditMask';
import TreeNode from './components/TreeNode';
import useBackground from './libs/useBackground';

const useFilterResults = (
	defaultEnabled: boolean
) => {
	const [enabled, updateEnabled] = useState<boolean>(defaultEnabled);
	const [result, updateResult] = useState<boolean[]>([]);
	const passResult = useMemo(() => new Array<boolean>(result.length).fill(true), [result.length]);
	const [resultCache, updateResultCache] = useState<boolean[]>(()=>[...passResult]);
	const setEnabled = useCallback((enabled:boolean) => {
		updateEnabled(enabled)
		updateResult(enabled ? resultCache : passResult)
	}, [resultCache, passResult])
	const setResult = useCallback((result:boolean[]) => {
		updateResultCache(result)
		if(enabled) updateResult(result)
	}, [enabled])

	return {enabled, result, setEnabled, setResult}
}

function App() {
	const [text, setText] = useState('')
	const addText = useCallback((text: string) => {
		setText(prev=>[prev,text].join('\n'))
	}, [setText])

	const [useTokenizer, setUseTokenizer] = useState(true)
	const [tokens, setTokens] = useState<Word[]>([])
	const [words, setWords] = useState<string[]>([])

	const filters = {
		length: useFilterResults(true),
		freq: useFilterResults(true),
		class: useFilterResults(true),
		words: useFilterResults(true)
	}

	useEffect(() => {
		const filterAllAnd = (a: boolean[], b: boolean[]) => {
			return a.map((v, i) => v && (i < b.length ? b[i] : true))
		}
		const filterAll = ((filters: {[key:string]:{result:boolean[]}}) => {
			const required_length = tokens.length
			return Object.keys(filters).reduce((acc, key) => {
				return filterAllAnd(acc, filters[key].result)
			}
			, new Array<boolean>(required_length).fill(true))
		})(filters)
		setWords(tokens.filter((_, i) => filterAll[i]).map(token => token.word))
	}, [tokens, filters.length.result, filters.freq.result, filters.class.result, filters.words.result])

	const [font, setFont] = useState('sans-serif')
	const fontList = useFontList(font)

	const [sizeOffset, setSizeOffset] = useState(0)
	const [sizeMult, setSizeMult] = useState(1)
	const sizeMapFunction = useCallback((value: number) => {
		return value * sizeMult + sizeOffset
	}, [sizeOffset, sizeMult])

	const captureElement = useRef<HTMLDivElement>(null)

	const [autoUpdate, setAutoUpdate] = useState(true)

	const [imageSize, setImageSize] = useState([512,512])
	const handleChangeImageSize = useCallback((width: number, height: number) => {
		setImageSize([width, height])
	}, [setImageSize])

	const background = useBackground(captureElement?.current, 'rgba(0,0,0,0')
	const [isUseBackgroundImage, setIsUseBackgroundImage] = useState(false)
	const backgroundImageSize = useRef([0,0])
	const handleBackgroundChange = useCallback(({color,image}:{color:{r:number,g:number,b:number,a:number},image:string}) => {
		if(color) {
			const {r,g,b,a} = color
			background.setColor(`rgba(${r},${g},${b},${a})`)
		}
		if(image) {
			background.setImage(image)
			{
				var element = new Image() ;
				element.onload = function () {
					console.info(`image loaded ${element.width}x${element.height}`)
					backgroundImageSize.current = [element.width, element.height]
				}
				element.src = image
			}
			setIsUseBackgroundImage(!!image)
		}
	}, [background.setColor, background.setImage, backgroundImageSize, backgroundImageSize?.current])

	const [mask, setMask] = useState<HTMLCanvasElement>()
	const [maskEnabled, setMaskEnabled] = useState(false)

	const [triggerUpdateImageRatio, setTriggerUpdateImageRatio] = useState(false)
	const handleSetImageSizeAspectRatio = useCallback((aspectRatio: number) => {
		console.info('setImageSizeAspectRatio', aspectRatio)
		setImageSize(([w,h]) => [Math.round(w), Math.round(w/aspectRatio)])
		setTriggerUpdateImageRatio(true)
	}, [setImageSize])
	useEffect(() => {
		if(triggerUpdateImageRatio) {
			setTriggerUpdateImageRatio(false)
		}
	}, [triggerUpdateImageRatio])

	return (
		<div className={styles.app}>
			<div className={styles.editorCol}>
				<TreeNode
					title="音声ファイルを選択"
					defaultOpen={true}
					showSwitch={false}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<Speech2Text onSentence={addText} onError={console.error} />
				</TreeNode>
				<TreeNode
					title="文字起こし結果"
					defaultOpen={true}
					showSwitch={false}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<textarea
						className={styles.border}
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder='直接入力もできます'
					/>
				</TreeNode>
				<TreeNode
					title="形態素解析"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={useTokenizer}
					onChangeEnabled={setUseTokenizer}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<Tokenizer text={text} onResult={setTokens} />
					<TreeNode
						title="品詞でフィルタ"
						defaultOpen={true}
						showSwitch={true}
						defaultEnable={true}
						onChangeEnabled={filters.class.setEnabled}
						className={styles.editorItem}
						titleClass={styles.heading3}
					>
						<WordClassFilter
							words={tokens}
							onResult={filters.class.setResult}
						/>
					</TreeNode>
				</TreeNode>
				<TreeNode
					title="語の長さでフィルタ"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={true}
					onChangeEnabled={filters.length.setEnabled}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<WordLengthRangeFilter
						words={tokens}
						onResult={filters.length.setResult}
					/>
				</TreeNode>
				<TreeNode
					title="出現回数でフィルタ"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={true}
					onChangeEnabled={filters.freq.setEnabled}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<WordFreqRangeFilter
						words={tokens}
						onResult={filters.freq.setResult}
					/>
				</TreeNode>
				<TreeNode
					title="除外語"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={true}
					onChangeEnabled={filters.words.setEnabled}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<WordDenyFilter
						words={tokens}
						onResult={filters.words.setResult}
					/>
				</TreeNode>
			</div>
			<div className={styles.editorCol}>
				<TreeNode
					title="フォント"
					defaultOpen={true}
					showSwitch={false}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<select
						className={styles.border}
						value={font}
						onChange={(e) => setFont(e.target.value)}
					>
						{fontList.map(font => (
							<option key={font} value={font}>{font}</option>
						))}
					</select>
				</TreeNode>
				<TreeNode
					title="文字サイズ"
					defaultOpen={true}
					showSwitch={false}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<div>
						<label htmlFor='sizeOffset'>{`オフセット(${sizeOffset})`}</label>
						<br />
						<input
							type='range'
							min='0'
							max='100'
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
							max='10'
							step='0.01'
							value={sizeMult}
							onChange={(e) => setSizeMult(Number(e.target.value))}
							name='sizeMult'
						/>
					</div>
				</TreeNode>
				<TreeNode
					title="マスク画像を設定"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={maskEnabled}
					className={styles.editorItem}
					titleClass={styles.heading3}
					onChangeEnabled={setMaskEnabled}
				>
					<EditMask
						onResult={setMask}
					/>
					{mask && maskEnabled &&
						<button
							onClick={e=> handleSetImageSizeAspectRatio(mask.width/mask.height)}
							className={styles.roundButton}
						>出力サイズに比率をコピー</button>
					}
				</TreeNode>
				<TreeNode
					title="背景を設定"
					defaultOpen={true}
					showSwitch={true}
					defaultEnable={background.enabled}
					className={styles.editorItem}
					titleClass={styles.heading3}
					onChangeEnabled={background.setEnabled}
				>
					<EditBackground
						onChange={handleBackgroundChange}
					/>
					{isUseBackgroundImage &&
						<button
							onClick={e=> handleSetImageSizeAspectRatio(backgroundImageSize.current[0]/backgroundImageSize.current[1])}
							className={styles.roundButton}
						>出力サイズに比率をコピー</button>
					}
				</TreeNode>
				<TreeNode
					title={`画像サイズ(${imageSize[0]}x${imageSize[1]})`}
					defaultOpen={false}
					showSwitch={false}
					className={styles.editorItem}
					titleClass={styles.heading3}
				>
					<EditSize2d 
						width={imageSize[0]}
						height={imageSize[1]}
						updateRatio={triggerUpdateImageRatio}
						onChange={handleChangeImageSize}
					/>
				</TreeNode>
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
					resultRef={captureElement}
					mask={maskEnabled ? mask:undefined}
					width={imageSize[0]}
					height={imageSize[1]}
					words={words}
					font={font}
					minFontSize={sizeOffset}
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
	editorCol : `
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
	roundButton : `
	border-2
	border-slate-600
	rounded-lg
	p-1
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