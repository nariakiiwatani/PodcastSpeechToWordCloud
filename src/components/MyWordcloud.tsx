import { useMemo, useRef } from 'react';
import { useWordCloud } from '../libs/WordCloud';

const MyWordcloud = (prop:{
	autoUpdate: boolean,
	drawRef?: React.MutableRefObject<HTMLDivElement>,
	width:number,
	height:number,
	words:string[],
	font?:string,
	minFontSize:number,
	valueMap?: (value:number)=>number
}) => {
	type Datum = [string, number]
	const { width, height, autoUpdate, drawRef, words, font, minFontSize, valueMap=v=>v } = prop
	const innerRef = useRef<HTMLDivElement>()
	drawRef.current = innerRef.current
	const cloudRef = useRef<HTMLDivElement>()

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
		elements: cloudRef.current,
		data,
		width,
		height,
		font: font || 'sanf-serif',
		minFontSize,
		weightFactor:valueMap,
	})
	return (<>
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
				className={styles.full}
			/>}
		</div>
	</>);
}

export default MyWordcloud


const styles = {
	full: `
	w-full
	h-full
	`
}
