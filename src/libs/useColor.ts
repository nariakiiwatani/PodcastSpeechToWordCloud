import { useState, useCallback } from 'react'

export type RGB = {r:number,g:number,b:number}
export type RGBA = RGB&{a:number}
export type HSV = {h:number,s:number,v:number}
export type HSVA = HSV&{a:number}
export type Color = RGB|RGBA|HSV|HSVA
export type Range<T> = {min:T, max:T}

const isObject = (a:any): a is Object => typeof a === 'object'
function compare(obj1:any, obj2:any, func:(a:any,b:any)=>boolean, recursive:boolean=false): boolean {
	if(!isObject(obj1) || !isObject(obj2)) {
		return func(obj1, obj2)
	}
	const keys1 = Object.keys(obj1)
	const keys2 = Object.keys(obj2)
	const keys = keys1.concat(keys2).filter((v, i, a) => a.indexOf(v) === i)
	return keys.every(key => {
		const a = obj1[key]
		const b = obj2[key]
		if (a === undefined || b === undefined) {
			return true
		}
		if(!recursive || !isObject(a) || !isObject(b)) {
			return func(a, b)
		}
		return compare(a, b, func, true)
	})
}
export function isRange(a:any): a is Range<any> {
	return isObject(a) && 'min' in a && 'max' in a
}
export function isInRange<T extends number|Color>(value:T, range:T|Range<T>): boolean {
	const v = isColor(value) ? isRGB(isRange(range) ? range.min : range) ? toRGB(value) : toHSV(value) : value
	return isRange(range) ? compare(v, range.min, (a, b) => a >= b) && compare(v, range.max, (a, b) => a <= b)
	: compare(v, range, (a, b) => a === b)
}
function hasAlpha(value:Color): value is RGBA|HSVA {
	return 'a' in value
}
// rgb to hsv
const rgb2hsv = (rgb: RGB|RGBA): HSV|HSVA => {
	const {r,g,b} = {r:rgb.r/255,g:rgb.g/255,b:rgb.b/255}
	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let {h,s,v} = {h:0,s:0,v:max}
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
	return hasAlpha(rgb) ? {h,s,v, a:rgb.a} : {h,s,v}
}
// hsv to rgb
const hsv2rgb = (hsv: HSV|HSVA): RGB|RGBA => {
	const {h,s,v} = hsv
	let {r,g,b} = {r:0,g:0,b:0}
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
	r *= 255
	g *= 255
	b *= 255
	return hasAlpha(hsv) ? {r,g,b, a: hsv.a} : {r,g,b}
}

export function isRGB(value?:any): value is RGB|RGBA {
	return value !== undefined && ['r','g','b'].some(key => key in value)
}
export function isHSV(value?:any): value is HSV|HSVA {
	return value !== undefined && ['h','s','v'].some(key => key in value)
}
export function isColor(value?:any): value is Color {
	return value !== undefined && (isRGB(value) || isHSV(value))
}
export function toRGB(value:Color): RGB|RGBA;
export function toRGB(value:Range<Color>): Range<RGB|RGBA>;
export function toRGB(value:Color|Range<Color>): RGB|RGBA|Range<RGB|RGBA> {
	if(isRange(value)) {
		return {min:toRGB(value.min), max:toRGB(value.max)}
	}
	if(isHSV(value)) {
		return hsv2rgb(value)
	}
	if(isRGB(value)) {
		return value
	}
	throw new Error('Invalid color')
}
export function toHSV(value:Color): HSV|HSVA;
export function toHSV(value:Range<Color>): Range<HSV|HSVA>;
export function toHSV(value:Color|Range<Color>): HSV|HSVA|Range<HSV|HSVA> {
	if(isRange(value)) {
		return {min:toHSV(value.min), max:toHSV(value.max)}
	}
	if(isRGB(value)) {
		return rgb2hsv(value)
	}
	if(isHSV(value)) {
		return value
	}
	throw new Error('Invalid color')
}

function getMiddle(a:number, b:number): number;
function getMiddle(a:Color, b:Color): Color;
function getMiddle(a:Color|number, b:Color|number): Color|number {
	if(typeof a === 'number' && typeof b === 'number') {
		return (a + b) / 2
	}
	if(isRGB(a) && isRGB(b)) {
		const ret:any = {r:(a.r + b.r) / 2, g:(a.g + b.g) / 2, b:(a.b + b.b) / 2}
		if(hasAlpha(a) || hasAlpha(b)) {
			ret.a = hasAlpha(a) && hasAlpha(b) ? getMiddle(a.a, b.a)
			: hasAlpha(a) ? a.a
			: hasAlpha(b) ? b.a : undefined
		}
		return ret
	}
	if(isHSV(a) && isHSV(b)) {
		const ret:any = {h:(a.h + b.h) / 2, s:(a.s + b.s) / 2, v:(a.v + b.v) / 2}
		if(hasAlpha(a) || hasAlpha(b)) {
			ret.a = hasAlpha(a) && hasAlpha(b) ? getMiddle(a.a, b.a)
			: hasAlpha(a) ? a.a
			: hasAlpha(b) ? b.a : undefined
		}
		return ret
	}
	throw new Error('Invalid color')
}
function getCenter(range:Range<Color>): Color {
	return getMiddle(range.min, range.max)
}

const useColor = (value:Color|Range<Color>) => {
	const getColorMode:(value:Color|Range<Color>)=>'rgb'|'hsv' = (value:Color|Range<Color>) => isRGB(isRange(value) ? value.min : value) ? 'rgb' : 'hsv'
	const [color, setColor] = useState(value)
	const [range, setRange] = useState(()=>isRange(value))
	const [colorMode, setColorMode] = useState<'rgb'|'hsv'>(()=>getColorMode(value))
	const updateColor = useCallback((value:Color|Range<Color>) => {
		setRange(isRange(value))
		setColorMode(getColorMode(value))
		setColor(value)
	}, [])
	const updateRange = useCallback((is:boolean) => {
		if(is === range) return
		updateColor(isRange(color)?getCenter(color):{min:color,max:color})
	}, [color, range])
	const updateColorMode = useCallback((mode:'rgb'|'hsv') => {
		if(mode === colorMode) return
		if(isRange(color)) {
			updateColor(mode === 'rgb' ? toRGB(color) : toHSV(color))
		}
		else {
			updateColor(mode === 'rgb' ? toRGB(color) : toHSV(color))
		}
	}, [color, colorMode])

	return {
		color,
		isRange:range,
		colorMode,
		updateColor,
		updateRange,
		updateColorMode,
	}
}
export default useColor