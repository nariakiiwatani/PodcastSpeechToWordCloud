import { useState, useCallback, useEffect } from 'react'
import { ChromePicker as ColorPicker } from 'react-color'

const EditColor = (prop:{
	onChange: (color: {r,g,b,a}) => void
	defaultValue: {r,g,b,a}
}) => {
	const { onChange, defaultValue } = prop
	const [color, setColor] = useState(defaultValue)
	const onChangeColor = useCallback((color) => {
		setColor(color.rgb)
		onChange && onChange(color.rgb)
	}, [onChange])
	return (<>
		<ColorPicker
			transparent
			color={color}
			onChange={onChangeColor}
		/>
	</>)
}

const EditImage = (prop:{
	onChange: (image: string) => void
	defaultValue?: string
}) => {
	const { onChange, defaultValue } = prop
	const [preview, setPreview] = useState(defaultValue)
	const handleChangeFile = useCallback((e) => {
		const { files } = e.target;
		if(files.length > 0) {
			const url = URL.createObjectURL(files[0])
			setPreview(url);
			onChange && onChange(url)
		}
	}, [onChange])
	return (<>
		<div>
			<input type='file' accept='image/*' 
				onChange={handleChangeFile}
			/>
			<img src={preview} />
		</div>
	</>)
}

const EditBackground = (prop:{
	element: React.RefObject<HTMLElement>
	onChange?: ({color,image}:{color?:{r,g,b,a}, image?: string}) => void
}) => {
	const { element, onChange } = prop
	const [color, setColor] = useState({r:255,g:255,b:255,a:1})
	const [image, setImage] = useState('')
	const [selection, setSelection] = useState('none')
	useEffect(() => {
		if(!element?.current) {
			return
		}
		const style = element.current.style
		if(selection === 'none') {
			style.backgroundImage = ''
			style.backgroundColor = ''
		}
		else if(selection === 'color') {
			const {r,g,b,a} = color
			style.backgroundColor = `rgba(${r},${g},${b},${a})`
			style.backgroundImage = ''
		}
		else if(selection === 'image') {
			style.backgroundImage = `url(${image})`
			style.backgroundSize = 'cover'
		}
		setSelection(selection)
		if(onChange) {
			selection === 'none' && onChange({})
			selection === 'color' && onChange({color})
			selection === 'image' && onChange({image})
		}
	}, [color, image, selection, element?.current])
	
	return (<>
		<h1>背景</h1>
		<input type="radio" name="background" id="none" defaultChecked
			onChange={e=>setSelection(e.target.id)}
			/>
		<label htmlFor="none">なし</label>
		<input type="radio" name="background" id="color"
			onChange={e=>setSelection(e.target.id)}
		/>
		<label htmlFor="color">Color</label>
		<input type="radio" name="background" id="image"
			onChange={e=>setSelection(e.target.id)}
			/>
		<label htmlFor="image">Image</label>
		
		{selection === 'color' && <EditColor onChange={setColor} defaultValue={color} />}
		{selection === 'image' && <EditImage onChange={setImage} defaultValue={image} />}
	</>)
}
export default EditBackground;


const styles = {
	colorPicker : `
		flex
		flex-none
		justify-center
		align-center
		cursor-pointer
		`,
	color : `
		flex
		flex-none
		justify-center
		align-center
		width-32
		height-32
		border-2
		border-radius-16
		`,
	imagePicker : `
		flex
		flex-none
		justify-center
		align-center
		cursor-pointer
		`,
	image : `
		flex
		flex-none
		justify-center
		align-center
		width-32
		height-32
		border-2
		border-radius-16
		`,
}