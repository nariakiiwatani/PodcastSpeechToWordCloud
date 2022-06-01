import { useCallback, useEffect } from 'react'
import { Word } from '../libs/Words'
import { useClassFilter } from '../libs/WordFilter'

export const WordClassFilter = (prop:{
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	const { words, onResult } = prop
	const { classCounts, allowed, allowedClass, setAllowedClass } = useClassFilter(words)
	const handleChecked = useCallback((className:string, checked:boolean) => {
		setAllowedClass(prev =>
			checked
			? [...prev, className]
			: prev.filter(c => c !== className)
		)
	}, [])
	useEffect(() => {
		onResult(allowed)
	}, [allowed])
	return (<>
		<div>
			{Array.from(classCounts.entries()).map(([className, words]) =>
				<label key={className}>
					<input type="checkbox"
						checked={allowedClass.includes(className)}
						onChange={e => handleChecked(className, e.target.checked)}
					/>
					{`${className} (${words.length})`}
				</label>
			)}
		</div>
	</>)
}
