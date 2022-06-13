import { useCallback, useEffect, useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';
import useColor, { Color, isRange as isRangeValue, Range } from '../libs/useColor'

type Props = {
	defaultColor: Color|Range<Color>,
	onChange: (color: Color|Range<Color>)=>void,
}

const ColorSlider = ({
	defaultColor, onChange
}:Props) => {
	const {
		color, isRange, colorMode, updateColor, updateRange, updateColorMode
	} = useColor(defaultColor);
	const handleChangeColorFormat = useCallback((type:'rgb'|'hsv') => {
		updateColorMode(type)
	}, [updateColorMode])
	const handleChangeRangeOrNot = useCallback((setRange:boolean) => {
		updateRange(setRange)
	}, [updateRange])
	const valueRange = {
		r : [0, 255, 1],
		g : [0, 255, 1],
		b : [0, 255, 1],
		h : [0, 1, 0.01],
		s : [0, 1, 0.01],
		v : [0, 1, 0.01],
		a : [0, 255, 1],
	}
	const [validMap, setValidMap] = useState({
		r : true,
		g : true,
		b : true,
		h : true,
		s : true,
		v : true,
		a : true,
	})
	useEffect(() => {
		const filter = (color:Color) => Object.entries(color).reduce((acc, [key, value]) => {
			if(validMap[key]) {
				acc[key] = value
			}
			return acc
		}, {} as Color)
		const new_color = isRangeValue(color) ? {min:filter(color.min), max:filter(color.max)} : filter(color)
		onChange(new_color)
	}, [color, validMap])

	const handleChange = useCallback((label: string, value:number|number[]) => {
		if(isRangeValue(color)) {
			updateColor({
				min: {
					...color.min,
					[label]: value[0]
				},
				max: {
					...color.max,
					[label]: value[1]
				}
			})
		}
		else {
			updateColor({
				...color,
				[label]: value
			})
		}
	}, [color])

	const Check = ({label}) => {
		return (<>
			<input type="checkbox" id={`validCheck_${label}`} checked={validMap[label]} onChange={(e) => {
				setValidMap(prev => ({...prev, [label]: e.target.checked}))
			}}/>
			<label htmlFor={`validCheck_${label}`}>{label.toUpperCase()}</label>
		</>)
	}

	const percent = (value:number) => `${Math.floor(value * 100)}%`
	const valueSlider = (label: string, value: number, range: [number, number, number]) => {
		return (<div key={label}>
			<Check label={label} />{validMap[label] && `(${percent(value/(range[1]-range[0]))})`}
			<Slider
				disabled={!validMap[label]}
				min={range[0]}
				max={range[1]}
				step={range[2]}
				included={false}
				value={value}
				onChange={(v) => handleChange(label, v)}
			/>
		</div>)
	}
	const rangeSlider = (label: string, value: [number, number], range: [number, number, number]) => {
		return (<div key={label}>
			<Check label={label} />{validMap[label] && `(${percent(value[0]/(range[1]-range[0]))} ~ ${percent(value[1]/(range[1]-range[0]))})`}
			<Slider range
				disabled={!validMap[label]}
				min={range[0]}
				max={range[1]}
				step={range[2]}
				value={value}
				onChange={(v) => handleChange(label, v)}
			/>
		</div>)
	}
	const makeSlider = (label: string, value: Color|Range<Color>) => 
		isRangeValue(value) ? rangeSlider(label, [value.min[label], value.max[label]], valueRange[label]) : valueSlider(label, value[label], valueRange[label])


	return (<>
		{/* <div>
			<input type="checkbox" id='rangeOrValue' checked={isRange} onChange={(e)=>{
				handleChangeRangeOrNot(e.target.checked)
			}}/>
			<label htmlFor="rangeOrValue">範囲で指定</label>
		</div> */}
		<div>
			<input type='radio' id='colorFormatRGB' checked={colorMode === 'rgb'} onChange={(e)=>{
				handleChangeColorFormat('rgb')
			}} value='rgb'/>
			<label htmlFor="colorFormatRGB">RGB</label>
			<input type='radio' id='colorFormatHSV' checked={colorMode === 'hsv'} onChange={(e)=>{
				handleChangeColorFormat('hsv')
			}} value='hsv'/>
			<label htmlFor="colorFormatHSV">HSV</label>
		</div>
		{Object.keys(isRangeValue(color)?color.min:color).map((label) => makeSlider(label, color))}
	</>)

}
export default ColorSlider