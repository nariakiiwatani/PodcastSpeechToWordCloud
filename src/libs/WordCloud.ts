import { useEffect } from 'react';
import WordCloud from 'wordcloud'

type ListEntry = [string, number];

export interface RotationSettings {
	ratio: number,
	range: [number, number],
	steps: number
}

type Props = {
	element: HTMLElement,
	mask: HTMLCanvasElement,
	bgColor?: {r:number,g:number,b:number,a:number},
	data: ListEntry[],
	width: number,
	height: number,
	font: string,
	minFontSize:number,
	weightFactor: (value: number) => number,
	rotation: RotationSettings
}

export const useWordCloud = ({
	element,
	mask,
	bgColor={r:0,g:0,b:0,a:0},
	data,
	width,
	height,
	font,
	minFontSize,
	weightFactor,
	rotation
}:Props) => {
	useEffect(() => {
		if(!element) {
			return
		}
		const maskCopy = mask ? document.createElement('canvas') : null
		if(maskCopy) {
			element.innerHTML = ''
			maskCopy.width = element.clientWidth
			maskCopy.height = element.clientHeight
			maskCopy.getContext('2d').drawImage(mask, 0, 0, mask.width, mask.height,
				0, 0, maskCopy.width, maskCopy.height)
		}
		WordCloud(maskCopy ? [maskCopy, element] : element, {
			list: data,
			gridSize: 8,
			weightFactor,
			fontFamily: font,
			fontWeight: 'normal',
			minSize: minFontSize,
			color: 'random-dark',
			backgroundColor: `rgba(${bgColor.r},${bgColor.g},${bgColor.b},${bgColor.a})`,
			origin: [element.clientWidth / 2, element.clientHeight / 2],
			drawOutOfBound: false,
			drawMask: false,
			maskColor: '#fff',
			clearCanvas: !maskCopy,
			shape:'square',
			rotateRatio:rotation.ratio,
			minRotation:rotation.range[0],
			maxRotation:rotation.range[1],
			rotationSteps:rotation.steps
		});
	}, [element, mask, data, width, height, font, minFontSize, weightFactor, rotation]);
	return [WordCloud.isSupported];
}
