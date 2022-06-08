import { useEffect } from 'react';
import WordCloud from 'wordcloud'

type ListEntry = [string, number];

export const useWordCloud = (props:{
	elements: HTMLElement | HTMLElement[],
	data: ListEntry[],
	width: number,
	height: number,
	font: string,
	minFontSize:number,
	weightFactor: (value: number) => number,
}) => {
	const { elements, data, width, height, font, minFontSize, weightFactor } = props;
	useEffect(() => {
		if(!elements) { return }
		WordCloud(elements, {
			list: data,
			gridSize: 8,
			weightFactor,
			fontFamily: font,
			fontWeight: 'normal',
			minSize: minFontSize,
			color: 'random-dark',
			backgroundColor: 'rgba(0,0,0,0)',
			origin: [width / 2, height / 2],
			drawOutOfBound: false,
			drawMask: false,
			maskColor: '#fff',
			shape:'square'
		});
	}, [elements, data, width, height, font, minFontSize, weightFactor]);
	return [WordCloud.isSupported];
}