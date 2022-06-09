import { useState, useCallback, useMemo } from 'react'

const useBackground = (
	element: HTMLElement,
	defaultColor?: string,
	defaultImage?: string,
) => {
	const [enabled, updateEnabled] = useState(defaultColor?true:defaultImage?true:false)
	const emptyStyle = useMemo(() => ({
		backgroundColor: '#fff',
		backgroundImage: 'none',
		backgroundSize: 'cover'
	}), [])
	const [currentStyle, setCurrentStyle] = useState(emptyStyle)
	const applyStyle = useCallback((style:{}) => {
		if(!element) return
		Object.entries(style).forEach(([key, value]) => {
			element.style[key] = value
		})
	}, [element])
	const setColor = useCallback((color:string) => {
		const newStyle = {
			...currentStyle,
			backgroundColor: color,
			backgroundImage: 'none',
			backgroundSize: 'cover'
		}
		setCurrentStyle(newStyle)
		if(enabled) applyStyle(newStyle)
	}, [element, enabled])
	const setImage = useCallback((image:string) => {
		const newStyle = {
			...currentStyle,
			backgroundColor: '#fff',
			backgroundImage: `url(${image})`,
			backgroundSize: 'cover'
		}
		setCurrentStyle(newStyle)
		if(enabled) applyStyle(newStyle)
	}, [element, enabled])
	const setEnabled = useCallback((enabled:boolean) => {
		applyStyle(enabled?currentStyle:emptyStyle)
		updateEnabled(enabled)
	}, [element, currentStyle, applyStyle])

	return {enabled, setEnabled, setColor, setImage }
}

export default useBackground