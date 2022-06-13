import { useState, useCallback, useEffect } from 'react'
import Slider from 'rc-slider'
import { RotationSettings } from '../libs/WordCloud'

type Prop = {
	defaultValue: RotationSettings
	onChange: (result:RotationSettings)=>void
}

const EditRotation = ({
	defaultValue,
	onChange
}:Prop) => {
	const [ratio, setRatio] = useState(defaultValue.ratio)
	const [steps, setSteps] = useState(defaultValue.steps)
	const [enableSteps, setEnableSteps] = useState(true)
	const [range, setRange] = useState<[number, number]>(defaultValue.range)
	const handleChangeRatio = useCallback(v => {
		setRatio(v)
	}, [])
	const handleChangeRange = useCallback(v => {
		setRange([radian(v[0]), radian(v[1])])
	}, [])
	const handleChangeSteps = useCallback(e => {
		setSteps(e.target.value)
	}, [])
	const handleChangeEnableSteps = useCallback(e => {
		setEnableSteps(e.target.checked)
	}, [])
	const percent = v => Math.floor(v*100)
	const degree = v => Math.floor(v/Math.PI*180)
	const radian = v => v/180*Math.PI
	useEffect(() => {
		onChange({
			ratio, range, steps:enableSteps?steps:0
		})
	}, [ratio, steps, enableSteps, range, onChange])
	return (<>
		<div>
			<span>確率({`${percent(ratio)}%`})</span>
			<Slider
				min={0}
				max={1}
				step={0.01}
				value={ratio}
				onChange={handleChangeRatio}
			/>
		</div>
		<div>
			<span>範囲({`${degree(range[0])}° ~ ${degree(range[1])}°`})</span>
			<Slider range
				min={degree(-Math.PI)}
				max={degree(Math.PI)}
				step={1}
				value={[degree(range[0]), degree(range[1])]}
				onChange={handleChangeRange}
			/>
		</div>
		<div>
			<input type='checkbox'
				id='enableRotationSteps'
				checked={enableSteps}
				onChange={handleChangeEnableSteps}
				/>
			<label htmlFor='enableRotationSteps'>ステップ({steps})</label>
			<input type='number'
				disabled={!enableSteps}
				value={steps}
				onChange={handleChangeSteps}
			/>
		</div>
	</>)
}
export default EditRotation