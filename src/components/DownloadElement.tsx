import { useCallback } from 'react'
import html2canvas from 'html2canvas';

const DownloadElement = (prop:{
	src: React.RefObject<HTMLElement>
	children: React.ReactNode
}) => {
	const { src:element, children } = prop
	const handleCapture = useCallback(async () => {
		if(!element?.current) {
			return
		}
		await html2canvas(element.current)
		.then(canvas => {
			let link = document.createElement("a");
			link.href = canvas.toDataURL();
			link.download = "wordcloud.png";
			link.click();
		})
	}, [element?.current])
	return (<>
		<div onClick={handleCapture}>
			{children}
		</div>
	</>)
}

export default DownloadElement
