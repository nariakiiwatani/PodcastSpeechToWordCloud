import { useMemo, useCallback, useRef } from 'react';
import Wordcloud from 'react-d3-cloud';

const MyWordcloud = (prop:{
	drawRef?: React.MutableRefObject<HTMLDivElement>,
	words:string[],
	valueMap?: (value:number)=>number
}) => {
	interface Datum {
		text: string,
		value: number
	}
	const { drawRef, words, valueMap=v=>v*100 } = prop
	const innerRef = useRef<HTMLDivElement>()
	drawRef.current = innerRef.current
	const data:Datum[] = useMemo(() => {
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
	}, [words, valueMap])

	return (<>
		<div
			ref={innerRef}
		>
			<Wordcloud
				data={data}
				width={512}
				height={512}
			/>
		</div>
	</>);
}

export default MyWordcloud