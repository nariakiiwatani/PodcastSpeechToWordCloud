// a react component that has 
// 'width' and 'height' fields,
// 'keep aspect ratio' checkbox.
//
// Language: typescript

import { useState, useCallback, useMemo, useEffect } from 'react'

const EditSize2d = (props: {
	width: number,
	height: number,
	updateRatio?: boolean
	onChange: (width: number, height: number) => void
}) => {
	const { width, height, updateRatio=false, onChange } = props
	const [widthInput, setWidthInput] = useState(width)
	const [heightInput, setHeightInput] = useState(height)
	const [keepAspectRatio, setKeepAspectRatio] = useState(true)
	const [aspectRatioToKeep, setAspectRatioToKeep] = useState(width/height)
	useEffect(() => {
		setWidthInput(width)
		setHeightInput(height)
		if (updateRatio && keepAspectRatio) {
			setAspectRatioToKeep(width/height)
		}
	}, [width, height, keepAspectRatio, updateRatio])
	const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if(!e.target.validity.valid || !e.target.value) return
		const value = parseInt(e.target.value)
		setWidthInput(value)
		if (keepAspectRatio) {
			setHeightInput(Math.round(value / aspectRatioToKeep))
		}
	}, [keepAspectRatio, aspectRatioToKeep, heightInput])
	const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if(!e.target.validity.valid || !e.target.value) return
		const value = parseInt(e.target.value)
		setHeightInput(value)
		if (keepAspectRatio) {
			setWidthInput(Math.round(value * aspectRatioToKeep))
		}
	}, [keepAspectRatio, aspectRatioToKeep, widthInput])
	const handleKeepAspectRatioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked
		setKeepAspectRatio(value)
		setAspectRatioToKeep(widthInput/heightInput)
	}, [widthInput, heightInput])
	const decide = useCallback(() => {
		onChange(widthInput, heightInput)
	}, [widthInput, heightInput, onChange])
	const aspectRatioStr = useMemo(() => {
		const gcd = (a: number, b: number) => {
			if (b === 0) {
				return a
			}
			return gcd(b, a % b)
		}
		const g = gcd(width, height)
		return `${width/g} : ${height/g}`
	}, [keepAspectRatio, aspectRatioToKeep])
	return (<>
		<div>
			<label>
				<input
					type="checkbox"
					checked={keepAspectRatio}
					onChange={handleKeepAspectRatioChange}
					name="keepAspectRatio"
				/>
				<span>比率を固定{keepAspectRatio&&`(${aspectRatioStr})`}</span>
			</label>
		</div>
		<div>
			<div>
				<label htmlFor='width'>X: </label>
				<input
					pattern='[1-9][0-9]*'
					type="text"
					value={widthInput}
					onChange={handleWidthChange}
					onBlur={decide}
					onKeyDown={(e) => e.key === 'Enter' && decide()}
					name="width"
					min={4}
				/>
			</div>
			<label>
				<label htmlFor='height'>Y: </label>
				<input
					pattern='[1-9][0-9]*'
					type="text"
					value={heightInput}
					onChange={handleHeightChange}
					onBlur={decide}
					onKeyDown={(e) => e.key === 'Enter' && decide()}
					name="height"
					min={4}
				/>
			</label>
		</div>
	</>)
}

export default EditSize2d