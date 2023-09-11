import { useState, useCallback, useEffect } from 'react'
import Slider from 'rc-slider'
import { RotationSettings } from '../libs/WordCloud'
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const percent = v => Math.floor(v*100)
const degree = v => Math.floor(v/Math.PI*180)
const radian = v => v/180*Math.PI

const ratioAtom = atomWithStorage('rotation-ratio', 0.5)
const stepsAtom = atomWithStorage('rotation-steps', 2)
const rangeAtom = atomWithStorage<[number,number]>('rotation-range', [radian(-90),radian(90)])
const enableStepsAtom = atomWithStorage('rotation-step-enabled', true)

const rotationSettingsAtom = atom((get)=>({
	ratio: get(ratioAtom),
	range: get(rangeAtom),
	steps: get(enableStepsAtom)?get(stepsAtom):0
}))

type Prop = {
	onChange: (result:RotationSettings)=>void
}

const EditRotation = ({
	onChange
}:Prop) => {
	const [ratio, setRatio] = useAtom(ratioAtom)
	const [range, setRange] = useAtom(rangeAtom)
	const [steps, setSteps] = useAtom(stepsAtom)
	const [enableSteps, setEnableSteps] = useAtom(enableStepsAtom)
	const handleChangeRatio = useCallback(v => {
		setRatio(v)
	}, [])
	const handleChangeRange = useCallback(v => {
		setRange(v.map(radian))
	}, [])
	const handleChangeSteps = useCallback(e => {
		const v = e.target.value
		setSteps(v)
	}, [])
	const handleChangeEnableSteps = useCallback(e => {
		const v = e.target.checked
		setEnableSteps(v)
	}, [])
	const rotationSettings = useAtomValue(rotationSettingsAtom)
	useEffect(() => {
		onChange(rotationSettings)
	}, [rotationSettings])
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