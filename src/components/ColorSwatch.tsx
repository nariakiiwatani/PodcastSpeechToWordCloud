import { useState, useMemo, useCallback, useEffect } from 'react'
import ColorSchemesFromLib, { calcColor } from '../libs/js-colormaps'
import { ChromePicker as ColorPicker } from 'react-color'
import { RGB, RGBA } from '../libs/useColor'
import FilterList from './FilterList';

import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage, atomFamily } from 'jotai/utils'

type InputColorScheme = {
	[key: string]: {
		interpolate: boolean,
		colors: [number, number, number][]
	}
}
const DefaultColorSchemes = ColorSchemesFromLib as InputColorScheme

type ColorMap = {
	interpolate: boolean,
	colors: RGBA[]
}
type ColorSchemeType = {
	[key: string]: ColorMap
}

function toCSSColor(color: RGBA, mul:number): string {
	return `rgba(${color.r*mul}, ${color.g*mul}, ${color.b*mul}, ${color.a})`
}
function toRGB(color: number[]|[number,number,number]|[number,number,number,number], mul:number): RGBA {
	return { r: color[0]*mul, g: color[1]*mul, b: color[2]*mul, a:1 }
}
type Props = {
	onChange: (colors: RGBA[]) => void
}
const makeDefaultColors = (name: string) => {
	return extractColors(DefaultColorSchemes[name])
}
const extractColors = (scheme: InputColorScheme[string], resolution: number = 8) => {
	function interpolated(x, colors) {
		let lo = Math.floor(x * (colors.length - 1));
		let hi = Math.ceil(x * (colors.length - 1));
		let r = Math.round((colors[lo][0] + colors[hi][0]) / 2 * 255);
		let g = Math.round((colors[lo][1] + colors[hi][1]) / 2 * 255);
		let b = Math.round((colors[lo][2] + colors[hi][2]) / 2 * 255);
		return [r, g, b];
	  }
	  
	return scheme.interpolate
	? [...Array(resolution)].map((_,i)=>interpolated(i/(resolution-1), scheme.colors)).map(c=>toRGB(c,1))
	: scheme.colors.map(c=>toRGB(c,255))
}
const allColorSchemesAtom = atomWithStorage<ColorSchemeType>('color-schemes', (() => {
	return Object.fromEntries(Object.entries(DefaultColorSchemes).map(([name, props]) => {
		return [
			name,
			{
				...props,
				colors: extractColors(props)
			}
		]
	}))
})())
const colorSchemesFamilyAtom = atomFamily((name: string) =>
  atom(
    (get) => get(allColorSchemesAtom)[name],
    (get, set, arg:RGBA[]) => {
		const prev = get(allColorSchemesAtom)
		set(allColorSchemesAtom, {
			...prev,
			[name]: {
				...prev[name],
				colors: arg
			}
		})
    }
  )
)
const selectedThemeAtom = atomWithStorage('color-scheme-selected', 'spring')
const ColorSwatch = ({
	onChange
}:Props) => {
	const [name, setName] = useAtom(selectedThemeAtom)
	const [colorScheme, setColorSchemes] = useAtom(colorSchemesFamilyAtom(name))
	const allColors = useAtomValue(allColorSchemesAtom)
	const options = useMemo(() => Object.keys(DefaultColorSchemes), [DefaultColorSchemes])
	const [pickerIndex, setPickerIndex] = useState(0)
	const [isPickerOpen, setIsPickerOpen] = useState(false)

	const handleChangeName = (name) => {
		setName(name)
	}

	const handleChangeColor = useCallback((color) => {
		const newColors = [...colorScheme.colors]
		newColors[pickerIndex] = color.rgb
		setColorSchemes(newColors)
	}, [colorScheme, pickerIndex])

	const handleReset = () => {
		setColorSchemes(makeDefaultColors(name))
	}

	useEffect(() => {
		onChange(colorScheme.colors)
	}, [colorScheme])

	const styleFn = useMemo(() => ({
		option: (provided, state) => {
			const {colors} = allColors[state.data.value]
			const length = colors.length
			return {
				...provided,
				color: state.selectProps.menuColor,
				background: `linear-gradient(to right, ${
					colors.map(({r,g,b,a},i)=>`rgba(${r},${g},${b},${a}) ${i/length*100}% ${(i+1)/length*100}%`).join(',')
				})`,
				filter: `brightness(${state.isFocused ? '100%' : '80%'})`
			}
		},
	}), [name, allColors])

	return (<div>
		<label>プリセットから選ぶ</label>
		<FilterList
			onChange={handleChangeName}
			items={options}
			selection={name}
			styles={styleFn}
		/>
		<div className={`mt-2`}>
			{colorScheme.colors.map((color, i) => (
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
		{isPickerOpen && colorScheme.colors.length > pickerIndex && (
			<ColorPicker
				color={colorScheme[pickerIndex]}
				onChange={handleChangeColor}
			/>
		)}
		<button
			className={styles.resetButton}
			onClick={handleReset}
		>reset</button>
	</div>)
}

export default ColorSwatch

const styles = {
	resetButton : `
	border-2
	border-slate-600
	p-1
	`,
}