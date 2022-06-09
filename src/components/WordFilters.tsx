import { useCallback, useState, useEffect, useMemo } from 'react'
import { FilterType } from '../libs/WordFilter'
import { Word } from '../libs/Words'
import { WordClassFilter } from './WordClassFilter'
import { WordLengthRangeFilter, WordFreqRangeFilter } from './WordRangeFilter'
import { WordDenyFilter } from './WordDenyFilter'

export const WordFilter = (prop:{
	words: Word[],
	type: FilterType,
	onResult:(allowed: boolean[])=>void
}) => {
	const {words, type, onResult} = prop
	return (<>
		{type === 'length' &&
		<>
			<p className={styles.heading3}>語の長さでフィルタ</p>
			<WordLengthRangeFilter
				words={words}
				onResult={onResult}
			/>
		</>}
		{type === 'freq' &&
		<>
			<p className={styles.heading3}>出現回数でフィルタ</p>
			<WordFreqRangeFilter
				words={words}
				onResult={onResult}
			/>
		</>}
		{type === 'class' &&
		<>
			<p className={styles.heading3}>品詞でフィルタ</p>
			<WordClassFilter
				words={words}
				onResult={onResult}
			/>
		</>}
		{type === 'words' &&
		<>
			<p className={styles.heading3}>除外語</p>
			<WordDenyFilter
				words={words}
				onResult={onResult}
			/>
		</>}
	</>)
}

const WordFilters = (prop:{
	className:string,
	words: Word[],
	filterTypes: FilterType[],
	onResult:(allowed: boolean[])=>void
}) => {
	const {className, words, filterTypes, onResult} = prop
	const initAllowed = useCallback(length => new Array<boolean[]>(length).fill(new Array<boolean>(words.length)), [words])
	const [allowed, setAllowed] = useState<boolean[][]>(() => initAllowed(filterTypes.length))
	useEffect(() => {
		if(allowed.length !== filterTypes.length) {
			setAllowed(initAllowed(filterTypes.length))
		}
	}, [allowed, filterTypes])
	const updateAllowed = useCallback((index:number, value:boolean[]) => {
		if(allowed.length === filterTypes.length) {
			setAllowed(prev => {
				return initAllowed(allowed.length)
				.map((v, i) => i === index ? [...value] : [...prev[i]])
			})
		}
	}, [allowed, filterTypes])
	const updateFunctions = useMemo(() => {
		return filterTypes.map((type, i) => {
			return (value:boolean[]) => updateAllowed(i, value)
		})
	}, [filterTypes, updateAllowed])
	useEffect(() => {
		onResult(allowed.reduce(
			(acc, v) => acc.map((a, i) => a && v[i]),
			new Array<boolean>(allowed[0].length).fill(true)
		))
	}, [allowed, onResult])
	return (<>
		{filterTypes.map((filterType,index) => (
			<div className={className}
				key={filterType+index}>
				<WordFilter
					type={filterType}
					words={words}
					onResult={updateFunctions[index]}
				/>
			</div>))}
	</>)
}

export default WordFilters

const styles = {
	heading3 : `
	text-xl
	text-slate-600
	font-semibold
	`,
}