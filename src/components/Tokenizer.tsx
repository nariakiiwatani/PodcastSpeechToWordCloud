import { useTokenizer } from '../libs/Tokenize';
import { useState, useEffect, useMemo } from 'react'
import { Word } from '../libs/Words'

export const Tokenizer = (prop:{
	text: string,
	onResult: (words: Word[])=>void
}) => {
	const {text, onResult} = prop
	const [useBaseForm, setUseBaseForm] = useState(false)
	const tokens = useTokenizer(text, {
		useBaseForm
	})
	useEffect(() => {
		onResult(tokens)
	}, [tokens, onResult])
	return (<>
		<input type='checkbox'
			checked={useBaseForm}
			onChange={(e) => setUseBaseForm(e.target.checked)}
			name='useBaseForm'
		/>
		<label htmlFor='useBaseForm'>基本形を使用する</label>
		<div>
			<p>{`${text.length} characters`}</p>
			<p>{`${tokens.length} tokens`}</p>
		</div>
	</>)
}
export const NoTokenizer = (prop:{
	text: string,
	onResult: (words: Word[])=>void
}) => {
	const {text, onResult} = prop
	useEffect(() => {
		const tokens = text.split(/\s+/).map(word => ({
			word,
			pos: '*',
		}))
		onResult(tokens)
	}, [text, onResult])
	return (<>
	</>)
}
