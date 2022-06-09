import { useEffect, useState, useMemo } from 'react';
import WordCloud from 'wordcloud'

type ListEntry = [string, number];

export const useWordCloud = (props:{
	element: HTMLElement,
	mask: HTMLCanvasElement,
	data: ListEntry[],
	width: number,
	height: number,
	font: string,
	minFontSize:number,
	weightFactor: (value: number) => number,
}) => {
	const { element, mask, data, width, height, font, minFontSize, weightFactor } = props;
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
			backgroundColor: 'rgba(0,0,0,0)',
			origin: [element.clientWidth / 2, element.clientHeight / 2],
			drawOutOfBound: false,
			drawMask: false,
			maskColor: '#fff',
			clearCanvas: !maskCopy,
			shape:'square'
		});
	}, [element, mask, data, width, height, font, minFontSize, weightFactor]);
	return [WordCloud.isSupported];
}

class MyCanvas extends HTMLCanvasElement {
	constructor(){
	  super();
	  // Other things
	}
}
window.customElements.define('my-canvas', MyCanvas, {extends: 'canvas'});

export const useMaskCanvas = (
) => {
	const [canvas, setCanvas] = useState<HTMLCanvasElement>(null);
	const [image, setImage] = useState(()=>new Image());
	const load = (url: string) => {
		return new Promise((resolve, reject) => {
			image.onload = () => {
				window.URL.revokeObjectURL(url)
				resolve(image);
			};
			image.onerror = () => {
				reject(new Error('Failed to load image'));
			};
			image.src = url;
		})
		.then((img:HTMLImageElement) => {
			const canvas = document.createElement('canvas');
			setCanvas(canvas)
			canvas.width = img.width
			canvas.height = img.height
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const newImageData = ctx.createImageData(imageData);
			for (let i = 0; i < imageData.data.length; i += 4) {
			  if (imageData.data[i] > 128) {
				newImageData.data[i] = 255;
				newImageData.data[i + 1] = 0;
				newImageData.data[i + 2] = 0;
				newImageData.data[i + 3] = 255;
			  } else {
				newImageData.data[i] = 0;
				newImageData.data[i + 1] = 0;
				newImageData.data[i + 2] = 0;
				newImageData.data[i + 3] = 0;
			  }
			}
			ctx.putImageData(newImageData, 0, 0);
		});
	}
	const clear = () => {
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	return { canvas, load, clear };
}