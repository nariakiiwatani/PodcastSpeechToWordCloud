import { useMemo, useRef } from 'react';
import { useWordCloud, useMaskCanvas } from '../libs/WordCloud';

const MyWordcloud = (prop:{
	autoUpdate: boolean,
	drawRef?: React.MutableRefObject<HTMLDivElement>,
	width:number,
	height:number,
	words:string[],
	font?:string,
	minFontSize:number,
	valueMap?: (value:number)=>number
	maskImage?: string,
}) => {
	type Datum = [string, number]
	const { width, height, autoUpdate, drawRef, words, font, minFontSize, valueMap=v=>v, maskImage } = prop
	const innerRef = useRef<HTMLDivElement>()
	drawRef.current = innerRef.current
	const cloudRef = useRef<HTMLDivElement>()

	const { canvas, load:loadMask, clear:clearMask } = useMaskCanvas()

	const dataRef = useRef<Datum[]>()
	const data:Datum[] = useMemo(() => {
		if(!autoUpdate) {
			return dataRef?.current
		}
		return words.reduce((acc, word) => {
			const found = acc.find(([text,_])=>word===text)
			if(found) {
				found[1]++
			} else {
				acc.push([word, 1])
			}
			return acc
		}, new Array<Datum>())
		.map(([w,v])=> ([w, valueMap(v)]))
	}, [width, height, words, font, valueMap, autoUpdate])
	dataRef.current = data
	const [isWordCloudSupported] = useWordCloud({
		element: cloudRef.current,
		mask: canvas,
		data,
		width,
		height,
		font: font || 'sanf-serif',
		minFontSize,
		weightFactor:valueMap,
	})
	return (<>
	<input type="file" accept="image/*" onChange={(e)=>{
		const file = e.target.files[0]
		if(!file) {
			clearMask()
			return
		}
		const reader = new FileReader()
		reader.onload = (e)=>{
			loadMask(reader.result as string)
		}
		reader.readAsDataURL(file)
	}}/>
		<div
			ref={innerRef}
			style={{
				minWidth: '100%',
				maxWidth: 'max-content',
				width: `${width}px`,
				aspectRatio: `${width}/${height}`,
			}}
		>
			{isWordCloudSupported && <div
				ref={cloudRef}
				className={styles.drawTarget}
			/>}
		</div>
	</>);
}

export default MyWordcloud


const styles = {
	drawTarget: `
	w-full
	h-full
	relative
	`
}
