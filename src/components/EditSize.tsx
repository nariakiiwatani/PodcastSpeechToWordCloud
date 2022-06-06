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
	const [keepAspectRatio, setKeepAspectRatio] = useState(false)
	const [aspectRatioToKeep, setAspectRatioToKeep] = useState(width/height)
	const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)
		const size = [value, height]
		if (keepAspectRatio) {
			size[1] = Math.round(value / aspectRatioToKeep)
		}
		onChange(size[0], size[1])
	}, [keepAspectRatio, aspectRatioToKeep, onChange])
	const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)
		const size = [width, value]
		if (keepAspectRatio) {
			size[0] = Math.round(value * aspectRatioToKeep)
		}
		onChange(size[0], size[1])
	}, [keepAspectRatio, aspectRatioToKeep, onChange])
	const handleKeepAspectRatioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked
		setKeepAspectRatio(value)
		setAspectRatioToKeep(width/height)
	}, [width, height])
	const aspectRatioStr = useMemo(() => {
		// calculate aspect ratio in rational integer
		const gcd = (a: number, b: number) => {
			if (b === 0) {
				return a
			}
			return gcd(b, a % b)
		}
		const g = gcd(width, height)
		return `${width/g} : ${height/g}`
	}, [width, height])
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
					type="number"
					value={width}
					onChange={handleWidthChange}
					name="width"
					min={4}
				/>
			</div>
			<label>
				<label htmlFor='height'>Y: </label>
				<input
					type="number"
					value={height}
					onChange={handleHeightChange}
					name="height"
					min={4}
				/>
			</label>
		</div>
	</>)
}

export default EditSize2d