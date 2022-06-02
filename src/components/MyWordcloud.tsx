import { useMemo } from 'react';
import Wordcloud from 'react-d3-cloud';

const MyWordcloud = (prop:{
	words:string[]
}) => {
	interface Datum {
		text: string,
		value: number
	}
	const { words } = prop
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
			value: w.value*100
		}))
	}, [words])

	return (<>
		<Wordcloud
			data={data}
			width={512}
			height={512}
		/>
	</>);
}

export default MyWordcloud