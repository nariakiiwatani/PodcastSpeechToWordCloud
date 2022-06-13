import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import useColor, { Range, Color, isInRange } from '../libs/useColor';
import ColorSlider from './ColorSlider';

class MyCanvas extends HTMLCanvasElement {
	constructor(){
	  super();
	  // Other things
	}
}
window.customElements.define('my-canvas', MyCanvas, {extends: 'canvas'});

const useMaskCanvas = (
	backgroundColor:{r:number,g:number,b:number,a:number},
	options?: {
		invert: boolean,
		clipColor?: Range<Color> | Color
	}
) => {
	const {invert, clipColor} = options
	const [original, setOriginal] = useState<HTMLImageElement>(null);
	const [binary, setBinary] = useState<HTMLCanvasElement>(null);
	const load = (url: string) => {
		const image = new Image();
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
		.then(setOriginal);
	}
	const checkFunction = useMemo(() => (color:Color) => {
		return !clipColor || (invert === isInRange(color, clipColor))
	}, [clipColor, invert])
	useEffect(() => {
		if(!original) {
			return;
		}
		const canvas = document.createElement('canvas');
		canvas.width = original.width
		canvas.height = original.height
		let ctx = canvas.getContext('2d');
		ctx.drawImage(original, 0, 0, original.width, original.height);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const newImageData = ctx.createImageData(imageData);
		for(let i = 0; i < imageData.data.length; i += 4) {
			const [r,g,b,a] = imageData.data.slice(i, i+4)
			if(checkFunction({r,g,b,a})) {
				newImageData.data[i] = backgroundColor.r;
				newImageData.data[i + 1] = backgroundColor.g;
				newImageData.data[i + 2] = backgroundColor.b;
				newImageData.data[i + 3] = backgroundColor.a;
			}
			else {
				newImageData.data[i] =
				newImageData.data[i + 1] =
				newImageData.data[i + 2] =
				newImageData.data[i + 3] = 255;
			}
		}
		ctx.putImageData(newImageData, 0, 0);
		setBinary(canvas)
	}, [original, checkFunction])
	const clear = () => {
		const ctx = binary.getContext('2d');
		ctx.clearRect(0, 0, binary.width, binary.height);
	}
	return { original, binary, load, clear };
}

const EditMask = (props:{
	onResult: (result:HTMLCanvasElement)=>void,
	backgroundColor?:{r:number,g:number,b:number,a:number}
}) => {
	const { onResult, backgroundColor={r:0,g:0,b:0,a:0} } = props

	const [invert, setInvert] = useState(false);
	const [clipColor, setClipColor] = useState<Range<Color> | Color>({min:{h:0,s:0,v:0.5}, max:{h:1,s:0,v:1}});

	const { binary:canvas, original, load:loadMask, clear:clearMask } = useMaskCanvas(backgroundColor, {invert, clipColor})

	const divRef = useRef<HTMLDivElement>(null)
	const originalRef = useRef<HTMLDivElement>(null)
	const maskRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		onResult(canvas)
	}, [canvas])
	useEffect(() => {
		if(!originalRef.current || !maskRef.current || !original || !canvas) {
			return
		}
		originalRef.current.style.backgroundImage = `url(${original.src})`
		originalRef.current.style.backgroundSize = `cover`
		maskRef.current.style.webkitMaskImage = `url(${canvas.toDataURL()})`
		maskRef.current.style.webkitMaskSize = `cover`
		if(divRef?.current) {
			const height = divRef.current.clientWidth*original.height/original.width
			divRef.current.style.height = `${height}px`
		}
	}, [canvas, original, originalRef?.current, maskRef?.current, divRef?.current])
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
		<div>
			<input type="checkbox" id='invert' checked={invert} onChange={(e)=>{
				setInvert(e.target.checked)
			}}/>
			<label htmlFor="invert">反転</label>
		</div>
		<div>
			<ColorSlider defaultColor={clipColor} onChange={setClipColor}/>
		</div>
		<div ref={divRef}
			className={`relative`}
		>
			<div ref={originalRef}
				className={'w-full h-full absolute'} />
			<div ref={maskRef}
				style={{
					backgroundColor: `#F88`,
					backgroundImage: `repeating-linear-gradient(-45deg,#333, #333 2px,transparent 0, transparent 4px)`,
				}}
				className={'w-full h-full absolute'}
			/>
		</div>
		<div>

		</div>
	</>)
}

export default EditMask