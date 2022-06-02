import { Tokenizer, getTokenizer } from "kuromojin";
import { useState, useEffect, useMemo } from 'react'
import { Word } from './Words'

type useTokenizerOptions = {
	dicPath?: string
	noCacheTokenize?: boolean
	useBaseForm?:boolean
}
export const useTokenizer = (text:string, options?:useTokenizerOptions) => {
	const [tokenizer, setTokenizer] = useState<Tokenizer>(null)
	useEffect(() => {
		if(tokenizer === null) {
			getTokenizer({
				dicPath: options?.dicPath || "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict",
				noCacheTokenize: options?.noCacheTokenize
			})
			.then(setTokenizer)
		}
	}, [])
	const tokens = useMemo(() => {
		if(tokenizer) {
			return tokenizer.tokenize(text)
		}
		return []
	}, [tokenizer, text, options?.useBaseForm])
	const result:Word[] = useMemo(() => tokens.map(token => ({
		word: options?.useBaseForm ? token.basic_form : token.surface_form,
		pos: token.pos,
	})), [tokens])

	return result
}
