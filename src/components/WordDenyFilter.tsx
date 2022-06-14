import { useState, useEffect } from 'react'
import { useDenyFilter } from '../libs/WordFilter';
import { Word } from '../libs/Words'

export const WordDenyFilter = (prop:{
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	const {words, onResult} = prop
	const {allowed, setDenyWords} = useDenyFilter(words)
	const [denyText, setDenyText] = useState('')
	useEffect(() => {
		onResult && onResult(allowed)
	}, [allowed])
	useEffect(() => {
		setDenyWords(denyText.split(/\s+/))
	}, [denyText])
	return (<>
		<div>
			<textarea
				value={denyText}
				onChange={e => setDenyText(e.target.value)}
				placeholder="結果から除外する語を入力してください"
			/>
		</div>
	</>)
}
