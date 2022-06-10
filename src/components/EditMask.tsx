import { useState, useEffect, useRef, useMemo } from 'react'


class MyCanvas extends HTMLCanvasElement {
	constructor(){
	  super();
	  // Other things
	}
}
window.customElements.define('my-canvas', MyCanvas, {extends: 'canvas'});

type RGB = {r:number,g:number,b:number}
type RGBA = RGB&{a:number}
type HSV = {h:number,s:number,v:number}
type HSVA = HSV&{a:number}
type Color = RGB|RGBA|HSV|HSVA
type Range<T> = {min:T, max:T}

const isRange = (color: number|Color|Range<number|Color>): color is Range<number|Color> => {
	return (color as Range<number|Color>).min !== undefined
}
const isRGB = (color: Color|Range<Color>): color is (RGB|Range<RGB>) => {
	return isRange(color) ? (color.min as RGB).r !== undefined : (color as RGB).r !== undefined
}
const isHSV = (color: Color|Range<Color>): color is (HSV|Range<HSV>) => {
	return isRange(color) ? (color.min as HSV).h !== undefined : (color as HSV).h !== undefined
}
const hasAlpha = (color: Color|Range<Color>): color is (RGBA|HSVA|Range<RGBA|HSVA>) => {
	return isRange(color) ? (color.min as RGBA|HSVA).a !== undefined : (color as RGBA|HSVA).a !== undefined
}
// rgb to hsv
const rgb2hsv = (rgb: RGB|RGBA): HSV|HSVA => {
	let r = rgb.r / 255
	let g = rgb.g / 255
	let b = rgb.b / 255
	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let h = 0
	let s = 0
	let v = max
	let d = max - min
	s = max === 0 ? 0 : d / max
	if (max === min) {
		h = 0 // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return hasAlpha(rgb) ? {h,s,v,a: rgb.a} : {h,s,v}
}
// hsv to rgb
const hsv2rgb = (hsv: HSV|HSVA): RGB|RGBA => {
	let h = hsv.h
	let s = hsv.s
	let v = hsv.v
	let r = 0
	let g = 0
	let b = 0
	let i = Math.floor(h * 6)
	let f = h * 6 - i
	let p = v * (1 - s)
	let q = v * (1 - f * s)
	let t = v * (1 - (1 - f) * s)
	switch (i % 6) {
		case 0:
			r = v, g = t, b = p;
			break;
		case 1:
			r = q, g = v, b = p;
			break;
		case 2:
			r = p, g = v, b = t;
			break;
		case 3:
			r = p, g = q, b = v;
			break;
		case 4:
			r = t, g = p, b = v;
			break;
		case 5:
			r = v, g = p, b = q;
			break;
	}
	return hasAlpha(hsv) ? {r: r * 255, g: g * 255, b: b * 255, a: hsv.a} : {r: r * 255, g: g * 255, b: b * 255}
}

const toRGBColor = (color: Color): RGB|RGBA => {
	return isRGB(color) ? color as RGB|RGBA : hsv2rgb(color as HSV|HSVA)
}
const toRGB = (color: Color|Range<Color>): RGB|RGBA|Range<RGB>|Range<RGBA> => {
	return isRange(color) ? {
		min: toRGBColor(color.min),
		max: toRGBColor(color.max)
	} : toRGBColor(color)
}
const isValueInRange = (checker: Range<number>, checkee: number): boolean => {
	return checker.min <= checkee && checkee <= checker.max
}
const isInRange = (checker?: Color|Range<Color>, checkee?: Color): boolean => {
	if(!checker) return true
	if(!checkee) return false
	const checkerRGB = toRGB(checker)
	const checkeeRGB = toRGB(checkee) as RGB|RGBA
	if(isRange(checkerRGB)) {
		return isValueInRange({min:checkerRGB.min.r, max:checkerRGB.max.r}, checkeeRGB.r)
			&& isValueInRange({min:checkerRGB.min.g, max:checkerRGB.max.g}, checkeeRGB.g)
			&& isValueInRange({min:checkerRGB.min.b, max:checkerRGB.max.b}, checkeeRGB.b)
			&& (!hasAlpha(checkerRGB) || !hasAlpha(checkeeRGB) || isValueInRange({min:checkerRGB.min.a, max:checkerRGB.max.a}, checkeeRGB.a))
	}
	return checkerRGB.r === checkeeRGB.r
		&& checkerRGB.g === checkeeRGB.g
		&& checkerRGB.b === checkeeRGB.b
		&& (!hasAlpha(checkerRGB) || !hasAlpha(checkeeRGB) || checkerRGB.a === checkeeRGB.a)
}

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
		return !clipColor || (invert !== isInRange(clipColor, color))
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
	const [clipColor, setClipColor] = useState<Range<Color>|Color>(()=>({min:hsv2rgb({h:0,s:0,v:0.5}), max:hsv2rgb({h:1,s:0,v:1})}));
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
		<input type="checkbox" checked={invert} onChange={(e)=>{
			setInvert(e.target.checked)
		}}/>
		<label htmlFor="invert">反転</label>
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
	</>)
}

export default EditMask