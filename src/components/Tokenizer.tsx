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
		useBaseForm,
		dicPath: 'dict',
	})
	useEffect(() => {
		onResult(tokens)
	}, [tokens, onResult])
	return (<div>
		<input type='checkbox'
			checked={useBaseForm}
			onChange={(e) => setUseBaseForm(e.target.checked)}
			name='useBaseForm'
		/>
		<label htmlFor='useBaseForm'>動詞と形容詞は基本形を使用する</label>
		<div>
			<p>{`(${text.length} characters, ${tokens.length} tokens)`}</p>
		</div>
	</div>)
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
	const tokens = useMemo(() =>
		text.split(/\s+/).map(word => ({
			word,
			pos: '*',
		})), [text])
	useEffect(() => {
		onResult(tokens)
	}, [tokens, onResult])
	return (<>
		<div>
			<p>{`(${text.length} characters, ${tokens.length} tokens)`}</p>
		</div>
	</>)
}
