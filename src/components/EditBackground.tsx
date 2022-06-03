import { useState, useCallback } from 'react'
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
	onChange: ({color,image}:{color?:{r,g,b,a}, image?: string}) => void
}) => {
	const { onChange } = prop
	const [color, setColor] = useState({r:255,g:255,b:0,a:1})
	const [image, setImage] = useState('')
	const [selection, setSelection] = useState('color')
	const handleSelectionChange = useCallback((e) => {
		const name = e.target.id
		setSelection(name)
		if(onChange) {
			name === 'color' && onChange({color})
			name === 'image' && onChange({image})
		}
	}, [color, image])
	const onChangeColor = useCallback((color) => {
		setColor(color)
		onChange && onChange({ color })
	}, [onChange])
	const onChangeImage = useCallback((image) => {
		setImage(image)
		onChange && onChange({ image })
	}, [onChange])
	
	return (<>
		<input type="radio" name="background" id="color" defaultChecked
			onChange={handleSelectionChange}
		/>
		<label htmlFor="color">Color</label>
		<input type="radio" name="background" id="image"
			onChange={handleSelectionChange}
		/>
		<label htmlFor="image">Image</label>
		
		{selection === 'color' && <EditColor onChange={onChangeColor} defaultValue={color} />}
		{selection === 'image' && <EditImage onChange={onChangeImage} defaultValue={image} />}
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