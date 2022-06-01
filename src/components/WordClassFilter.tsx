import { useState, useCallback, useEffect } from 'react'
import { Word } from '../libs/Words'
import { useClassFilter } from '../libs/WordFilter'
import ReactTooltip from 'react-tooltip'

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
	const [tooltip, showTooltip] = useState(true)
	console.info(Array.from(classCounts.entries()))
	return (<>
		<div>
			{Array.from(classCounts.entries()).map(([className, words]) =>
				<>
					{tooltip && <ReactTooltip
						id={className}
					>
						<span style={{wordBreak:'keep-all'}}>{words.map(({word}) => word).join('\n')}</span>
					</ReactTooltip>}
					<label
						key={className}
						data-tip
						data-for={className}
						onMouseEnter={ () => {
							showTooltip(false)
							setTimeout(() => showTooltip(true), 50)
						}}
						onMouseLeave={() => showTooltip(false)}
					>
						<input type="checkbox"
							checked={allowedClass.includes(className)}
							onChange={e => handleChecked(className, e.target.checked)}
						/>
						{`${className} (${words.length})`}
					</label>
				</>
			)}
		</div>
	</>)
}
