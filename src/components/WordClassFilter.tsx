import { useState, useCallback, useEffect, useMemo } from 'react'
import { Word } from '../libs/Words'
import { useClassFilter } from '../libs/WordFilter'
import ReactTooltip from 'react-tooltip'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

const allowedClassMapAtom = atomWithStorage<Record<string, boolean>>('class-filter-words-map', {})

export const WordClassFilter = (prop:{
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	const { words, onResult } = prop
	const [allowedClassMap, setAllowedClassMap] = useAtom(allowedClassMapAtom)
	const allowedClass = useMemo(() => Object.keys(allowedClassMap), [allowedClassMap])
	const { classCounts, allowed } = useClassFilter(words, allowedClass)
	const handleChecked = useCallback((className:string, checked:boolean) => {
		setAllowedClassMap(prev => ({
			...prev,
			[className]: checked
		}))
	}, [])
	useEffect(() => {
		onResult(allowed)
	}, [allowed])
	const [tooltip, showTooltip] = useState(true)
	return (<>
		<div>
			{Array.from(classCounts.entries()).map(([className, words]) =>
				<span key={className}>
					{tooltip && <ReactTooltip
						id={className}
					>
						<span style={{wordBreak:'keep-all'}}>{words.map(({word}) => word).join('\n')}</span>
					</ReactTooltip>}
					<label
						data-tip
						data-for={className}
						onMouseEnter={ () => {
							showTooltip(false)
							setTimeout(() => showTooltip(true), 50)
						}}
						onMouseLeave={() => showTooltip(false)}
					>
						<input type="checkbox"
							checked={Object.keys(allowedClassMap).includes(className)?allowedClassMap[className]:true}
							onChange={e => handleChecked(className, e.target.checked)}
						/>
						{`${className} (${words.length})`}
					</label>
				</span>
			)}
		</div>
	</>)
}
