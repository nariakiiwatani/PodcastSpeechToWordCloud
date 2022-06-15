import { useState, useMemo, useCallback } from 'react'
import ColorScheme, { calcColor } from '../libs/js-colormaps'
import { ChromePicker as ColorPicker } from 'react-color'
import { RGBA } from '../libs/useColor'
import FilterList from './FilterList';

type ColorMap = {
	interpolate: boolean,
	colors: [[number, number, number]]
}
type ColorSchemeType = {
	[key: string]: ColorMap
}

function toCSSColor(color: RGBA, mul:number): string {
	return `rgba(${color.r*mul}, ${color.g*mul}, ${color.b*mul}, ${color.a})`
}
function toRGB(color: [number, number, number], mul:number): RGBA {
	return { r: color[0]*mul, g: color[1]*mul, b: color[2]*mul, a:1 }
}
type Props = {
	colors?: RGBA[]
	onChange: (colors: RGBA[]) => void
}
const defaultTheme = 'spring'
const makeColors = (name: string, resolution:number=8): RGBA[] => {
	if(!(name in ColorScheme)) {
		return []
	}
	const scheme = ColorScheme[name]
	return scheme.interpolate
	? [...Array(resolution)].map((_,i)=>calcColor(i/(resolution-1), name)).map(c=>toRGB(c,1))
	: scheme.colors.map(c=>toRGB(c,255))
}

const ColorSwatch = ({
	colors = (makeColors(defaultTheme)),
	onChange
}:Props) => {
	const [name, setName] = useState(defaultTheme)
	const handleChangeName = useCallback((name) => {
		setName(name)
		onChange(makeColors(name))
	}, [ColorScheme, calcColor])
	const [pickerIndex, setPickerIndex] = useState(0)
	const [isPickerOpen, setIsPickerOpen] = useState(false)

	const handleChangeColor = useCallback((color) => {
		const newColors = [...colors]
		newColors[pickerIndex] = color.rgb
		onChange(newColors)
	}, [colors, pickerIndex,])
	const options = useMemo(() => Object.keys(ColorScheme as ColorSchemeType), [ColorScheme])

	return (<div>
		<label>プリセットから選ぶ</label>
		<FilterList
			onChange={handleChangeName}
			items={options}
			selection={name}
		/>
		<div className={`mt-2`}>
			{colors.map((color, i) => (
				<div key={i} style={{
					backgroundColor: toCSSColor(color, 1),
					width: '20px',
					height: '20px',
					display: 'inline-block',
					margin: '0 5px'
				}}
					onClick={e=> {
						if(pickerIndex === i && isPickerOpen) {
							setIsPickerOpen(false)
						}
						else {
							setPickerIndex(i)
							setIsPickerOpen(true)
						}
					}}
				/>
			))}
		</div>
		{isPickerOpen && colors.length > pickerIndex && (
			<ColorPicker
				color={colors[pickerIndex]}
				onChange={handleChangeColor}
			/>
		)}
	</div>)
}

export default ColorSwatch