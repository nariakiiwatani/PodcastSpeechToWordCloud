import { useCallback } from 'react'
import { toCanvas } from 'html-to-image';

const DownloadElement = (prop:{
	src: React.RefObject<HTMLElement>
	children: React.ReactNode
	width: number
	height: number
}) => {
	const { src:element, width, height, children } = prop
	const handleCapture = useCallback(async () => {
		if(!element?.current) {
			return
		}
		await toCanvas(element.current, {
			canvasWidth: width,
			canvasHeight: height,
			pixelRatio: 1,
		})
		.then(canvas => {
			let link = document.createElement("a");
			link.href = canvas.toDataURL();
			link.download = "wordcloud.png";
			link.click();
		})
	}, [element?.current, width, height])
	return (<>
		<div onClick={handleCapture}>
			{children}
		</div>
	</>)
}

export default DownloadElement
