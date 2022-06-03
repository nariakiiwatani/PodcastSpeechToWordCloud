import { useMemo, useState, useRef } from 'react';
import Wordcloud from 'react-d3-cloud';

const MyWordcloud = (prop:{
	autoUpdate: boolean,
	drawRef?: React.MutableRefObject<HTMLDivElement>,
	words:string[],
	font?:string,
	valueMap?: (value:number)=>number
}) => {
	interface Datum {
		text: string,
		value: number
	}
	const { autoUpdate, drawRef, words, font, valueMap=v=>v*100 } = prop
	const innerRef = useRef<HTMLDivElement>()
	drawRef.current = innerRef.current

	const dataRef = useRef<Datum[]>()
	const data:Datum[] = useMemo(() => {
		if(!autoUpdate) {
			return dataRef?.current
		}
		return words.reduce((acc, word) => {
			const found = acc.find(({text})=>word===text)
			if(found) {
				found.value++
			} else {
				acc.push({
					text:word,
					value: 1
				})
			}
			return acc
		}, new Array<Datum>())
		.map(w=> ({
			...w,
			value: valueMap(w.value)
		}))
	}, [words, font, valueMap, autoUpdate])
	dataRef.current = data
	return (<>
		<div
			ref={innerRef}
		>
			<Wordcloud
				data={dataRef?.current}
				width={512}
				height={512}
				font={font || 'sanf-serif'}
			/>
		</div>
	</>);
}

export default MyWordcloud