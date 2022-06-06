// a react component that has 
// 'width' and 'height' fields,
// 'keep aspect ratio' checkbox.
//
// Language: typescript

import { useState, useEffect, useCallback, useMemo } from 'react'

const EditSize2d = (props: {
	width: number,
	height: number,
	onChange: (width: number, height: number) => void
}) => {
	const { width, height, onChange } = props
	const [widthInput, setWidthInput] = useState(width)
	const [heightInput, setHeightInput] = useState(height)
	const [keepAspectRatio, setKeepAspectRatio] = useState(true)
	const [aspectRatioToKeep, setAspectRatioToKeep] = useState(width/height)
	const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if(!e.target.validity.valid || !e.target.value) return
		const value = parseInt(e.target.value)
		setWidthInput(value)
		const size = [value, heightInput]
		if (keepAspectRatio) {
			setHeightInput(Math.round(value / aspectRatioToKeep))
		}
//		onChange(size[0], size[1])
	}, [keepAspectRatio, aspectRatioToKeep, heightInput])
	const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if(!e.target.validity.valid || !e.target.value) return
		const value = parseInt(e.target.value)
		setHeightInput(value)
		const size = [widthInput, value]
		if (keepAspectRatio) {
			setWidthInput(Math.round(value * aspectRatioToKeep))
		}
//		onChange(size[0], size[1])
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
	}, [keepAspectRatio])
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