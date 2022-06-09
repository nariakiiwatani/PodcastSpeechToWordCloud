import { useEffect } from 'react'
import { useMaskCanvas } from '../libs/WordCloud'

const EditMask = (props:{
	onResult: (result:HTMLCanvasElement)=>void,
}) => {
	const { onResult } = props
	const { canvas, load:loadMask, clear:clearMask } = useMaskCanvas()

	useEffect(() => {
		onResult(canvas)
	}, [canvas])
	return (<>
		<input type="file" accept="image/*" onChange={(e)=>{
			const file = e.target.files[0]
			if(!file) {
				clearMask()
				return
			}
			const reader = new FileReader()
			reader.onload = (e)=>{
				loadMask(reader.result as string)
			}
			reader.readAsDataURL(file)
		}}/>
	</>)
}

export default EditMask