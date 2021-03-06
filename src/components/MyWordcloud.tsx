import { RGBA } from '../libs/useColor';
import { useMemo, useRef, useState } from 'react';
import { useWordCloud } from '../libs/WordCloud';

import { RotationSettings } from '../libs/WordCloud';

type Props = {
	resultRef?: React.MutableRefObject<HTMLDivElement>,
	bgRef?: React.MutableRefObject<HTMLDivElement>,
	mask?: HTMLCanvasElement,
	width:number,
	height:number,
	words:string[],
	font?:string,
	minFontSize:number,
	colors?:RGBA[]|string
	valueMap?: (value:number)=>number,
	rotation: RotationSettings
}

const MyWordcloud = ({
	width,
	height,
	resultRef,
	bgRef,
	words,
	font,
	colors='random-dark',
	minFontSize,
	valueMap=v=>v,
	mask,
	rotation
}:Props) => {
	type Datum = [string, number]
	const cloudRef = useRef<HTMLDivElement>()
	const [autoUpdate, setAutoUpdate] = useState(true)

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
	}, [words, autoUpdate, valueMap])
	dataRef.current = data
	const [isWordCloudSupported] = useWordCloud({
		element: cloudRef.current,
		mask,
		data,
		width,
		height,
		font: font || 'sanf-serif',
		colors,
		minFontSize,
		rotation,
		weightFactor:valueMap,
	})
	return (<>
		<input
			type='checkbox'
			checked={autoUpdate}
			onChange={(e) => setAutoUpdate(e.target.checked)}
			id='autoUpdate'
		/>
		<label htmlFor='autoUpdate'>自動更新</label>
		<div
			ref={resultRef}
			style={{
				position: 'relative',
				minWidth: '100%',
				maxWidth: 'max-content',
				width: `${width}px`,
				aspectRatio: `${width}/${height}`,
				overflow: 'hidden'
			}}
		>
		<div
			ref={bgRef}
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%'
			}}
		 />
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
