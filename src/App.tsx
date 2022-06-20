import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Tokenizer } from './components/Tokenizer';
import MyWordCloud from './components/MyWordcloud';
import { RotationSettings } from './libs/WordCloud'
import Speech2Text from './components/Speech2Text';
import { Word } from './libs/Words';
import { WordClassFilter } from './components/WordClassFilter'
import { WordLengthRangeFilter, WordFreqRangeFilter } from './components/WordRangeFilter'
import { WordDenyFilter } from './components/WordDenyFilter'
import EditBackground from './components/EditBackground';
import DownloadElement from './components/DownloadElement';
import EditSize2d from './components/EditSize';
import EditMask from './components/EditMask';
import TreeNode from './components/TreeNode';
import useBackground from './libs/useBackground';
import EditRotation from './components/Rotation'
import ColorSwatch from './components/ColorSwatch';
import { RGBA } from './libs/useColor';
import Header from './components/Header';
import FontList from './components/FontList';
import MultiSlider from './components/MultiSlider'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';

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

	const [sizeFactors, setSizeFactors] = useState([0,1,1])
	const [sizeLimits, setSizeLimits] = useState<number|number[]>([10,300])
	const sizeMapFunction = useCallback((value: number) => 
		Math.min(sizeLimits[1], Math.max(sizeLimits[0], [...sizeFactors].reverse().reduce((acc,factor,i)=>acc+Math.pow(value,i)*factor, 0)))
	,[sizeFactors, sizeLimits])

	const [colors, setColors] = useState<RGBA[]>()

	const [rotation, setRotation] = useState<RotationSettings>({
		ratio:0.5,
		range:[0, Math.PI/2],
		steps:2
	})

	const captureElement = useRef<HTMLDivElement>(null)
	const bgElement = useRef<HTMLDivElement>(null)

	const [imageSize, setImageSize] = useState([512,512])
	const handleChangeImageSize = useCallback((width: number, height: number) => {
		setImageSize([width, height])
	}, [setImageSize])

	const background = useBackground(bgElement?.current, 'rgba(0,0,0,0')
	const [isUseBackgroundImage, setIsUseBackgroundImage] = useState(false)
	const [backgroundImageSize, setBackgroundImageSize] = useState([0,0])
	const [backgroundBlur, setBackgroundBlur] = useState(0)
	const handleBackgroundChange = useCallback(({color,image}:{color:{r:number,g:number,b:number,a:number},image:string}) => {
		if(color) {
			const {r,g,b,a} = color
			background.setColor(`rgba(${r},${g},${b},${a})`)
		}
		if(image) {
			background.setImage(image)
			var element = new Image()
			element.onload = () => {
				setBackgroundImageSize([element.width, element.height])
			}
			element.src = image
			setIsUseBackgroundImage(!!image)
		}
	}, [background.setColor, background.setImage])
	useEffect(() => {
		const style = bgElement?.current?.style
		if(!style) return
		style.filter = `blur(${backgroundBlur}px)`
		style.left = style.top = style.right = style.bottom = `0px`
	}, [backgroundBlur])

	const [mask, setMask] = useState<HTMLCanvasElement>()
	const [maskEnabled, setMaskEnabled] = useState(false)

	const [triggerUpdateImageRatio, setTriggerUpdateImageRatio] = useState(false)
	const handleSetImageSizeAspectRatio = useCallback((aspectRatio: number) => {
		setImageSize(([w,h]) => [Math.round(w), Math.round(w/aspectRatio)])
		setTriggerUpdateImageRatio(true)
	}, [setImageSize])
	useEffect(() => {
		if(triggerUpdateImageRatio) {
			setTriggerUpdateImageRatio(false)
		}
	}, [triggerUpdateImageRatio])

	return (
	<div className={styles.main}>
		<div className={styles.header}>
			<Header />
		</div>
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
						titleClass={styles.heading4}
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
					<FontList
						onChange={setFont}
						selection={font} />
					<TreeNode
						title="サイズ"
						defaultOpen={true}
						showSwitch={false}
						className={styles.editorItem}
						titleClass={styles.heading4}
					>
						<p>= Ax^2 + Bx + C (x: 出現回数)</p>
						<MultiSlider
							labels={['A','B','C'].map((v,i)=>`${v}(${sizeFactors[i]})`)}
							value={sizeFactors}
							onChange={setSizeFactors}
							sliderProps={[{
								min:-10,
								max:10,
								step:0.01
							},{
								min:-10,
								max:10,
								step:0.01
							},{
								min:-100,
								max:100,
								step:1
							}]}
						/>
						<p>{`limit(${sizeLimits[0]}~${sizeLimits[1]})`}</p>
						<Slider range
							value={sizeLimits}
							min={1}
							max={500}
							onChange={setSizeLimits}
						/>
					</TreeNode>
					<TreeNode
						title="色"
						defaultOpen={true}
						showSwitch={false}
						className={styles.editorItem}
						titleClass={styles.heading4}
					>
						<ColorSwatch
							colors={colors}
							onChange={setColors}
						/>
					</TreeNode>
					<TreeNode
						title="回転"
						defaultOpen={true}
						showSwitch={false}
						className={styles.editorItem}
						titleClass={styles.heading4}
					>
						<EditRotation
							defaultValue={rotation}
							onChange={setRotation}
						/>
					</TreeNode>
				</TreeNode>
				<TreeNode
					title="配置マスク"
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
					title="背景"
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
					{isUseBackgroundImage && <>
						<label htmlFor='blurPixels'>{`ぼかし(${backgroundBlur})`}</label>
						<input type='range'
							id='blurPixels'
							min='0'
							max='32'
							step='1'
							value={backgroundBlur}
							onChange={(e) => setBackgroundBlur(parseInt(e.target.value))}
							name='backgroundBlur'
						/>
						<button
							onClick={e=> handleSetImageSizeAspectRatio(backgroundImageSize[0]/backgroundImageSize[1])}
							className={styles.roundButton}
						>出力サイズに比率をコピー</button>
						</>
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
			<TreeNode
				title='プレビュー'
				canToggleOpen={false}
				defaultOpen={true}
				showSwitch={false}
				className={styles.preview}
				titleClass={styles.heading3}
			>
				<MyWordCloud
					resultRef={captureElement}
					bgRef={bgElement}
					mask={maskEnabled ? mask:undefined}
					width={imageSize[0]}
					height={imageSize[1]}
					words={words}
					font={font}
					colors={colors}
					minFontSize={1}
					valueMap={sizeMapFunction}
					rotation={rotation}
				/>
			</TreeNode>
		</div>
	</div>);
}

export default App;

const styles = {
	main: `
	w-full h-full
	flex flex-col
	absolute
	`,
	header: `
	basis-8
	`,
	app : `
	flex
	flex-row
	gap-4
	border-2
	w-full
	min-w-0
	h-full
	min-h-0
	`,
	editorCol : `
	flex
	flex-col
	basis-1/6
	gap-4
	p-2
	m-1
	border-2
	overflow-y-scroll
	h-full
	`,
	editorItem : `
	flex-none
	p-2
	pb-8
	border-b-2
	last:border-b-0
	last:pb-2
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
	heading4 : `
	text-lg
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