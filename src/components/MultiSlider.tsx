import Slider, { SliderProps } from 'rc-slider'
import 'rc-slider/assets/index.css';
import { useMemo } from 'react'

type Props = {
	labels?: string[]
	value: number[]
	sliderProps?: SliderProps | SliderProps[]
	onChange?: (result: number[]) => void
}
const MultiSlider = ({
	labels, value, sliderProps, onChange
}:Props) => {
	const sp = useMemo(() => {
		const sp = Array.isArray(sliderProps)?[...sliderProps]:[sliderProps]
		return sp.length === 0 ? sp : Array.from({length:value.length}, (e,i)=>sp[i%sp.length])
	}, [value, sliderProps])
	const handleChange = useMemo(() => 
		Array(value.length).fill(0).map((_,i)=>v=>{
			onChange(value.map((v_,i_)=>i===i_?v:v_))
		})
	, [onChange, value])
	return (<>
		{value.map((v,i) =><div key={i}>
		{labels && labels.length > i && <span>{labels[i]}</span>}
		<Slider
			{...sp[i]}
			value={v}
			onChange={handleChange[i]}
		/>
		</div>)}
	</>)
}

export default MultiSlider