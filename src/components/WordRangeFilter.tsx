import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';
import { ReactNode, useMemo, useRef, useEffect, useState, useCallback } from 'react'
import ReactTooltip from 'react-tooltip'
import { FilterType, useWordFilter } from '../libs/WordFilter'
import { Word } from '../libs/Words'

type Range = {
	min:number,
	max:number
}
type RangeSliderProps = {
	bounds:Range,
	range:Range,
	setRange:(range:Range)=>void,
	marks?:{[id:number]: ReactNode} | {[id:number]: { style, label }}
}
const RangeSlider = ({
	bounds, range, setRange, marks
}:RangeSliderProps) => {
	const handleChange = useCallback(([min, max]) => {
		setRange({min, max})
	}, [setRange])
	return (<>
		<div>
			<Slider range
				allowCross={true}
				min={bounds.min}
				max={bounds.max}
				value={[range.min, range.max]}
				marks={marks}
				draggableTrack
				onChange={handleChange}
			/>
		</div>
	</>);
}

const WordRangeFilterImpl = (prop:{
	filterName: string,
	words: Word[],
	scoreCounts: Map<number,Word[]>,
	allowed: boolean[],
	bounds: Range,
	range: Range,
	setRange: (range:Range)=>void,
	onResult: (allowed: boolean[])=>void
}) => {
	const {filterName, words, scoreCounts, allowed, bounds, range, setRange, onResult} = prop
	const prev_bounds = useRef<Range>(bounds)
	useEffect(() => {
		const bounds_diff = {
			min: bounds.min - prev_bounds.current!.min,
			max: bounds.max - prev_bounds.current!.max
		}
		const new_range = {
			min: range.min + bounds_diff.min,
			max: range.max + bounds_diff.max
		}
		if (new_range.min > new_range.max) {
			[new_range.min, new_range.max] = [new_range.max, new_range.min]
		}
		[new_range.min, new_range.max] = [
			Math.max(new_range.min, bounds.min),
			Math.min(new_range.max, bounds.max)
		]
		setRange(new_range)
		return () => {
			prev_bounds.current = bounds
		}
	}, [bounds])
	useEffect(() => {
		prop.onResult(allowed)
	}, [allowed, prop.onResult])
	const [tooltip, showTooltip] = useState(true)
	const marks = useMemo(() => {
		const marks: {[id:number]: ReactNode} = {}
		scoreCounts.forEach((words, score) => {
			const id = `${filterName}${score}`
			marks[score] = (<div key={id}>
				{tooltip && <ReactTooltip
					id={id}
				>
					<span style={{wordBreak:'keep-all'}}>{words.map(({word}) => word).join('\n')}</span>
				</ReactTooltip>}
				<span
					data-tip
					data-for={id}
					onMouseEnter={() => {
						showTooltip(false)
						setTimeout(() => showTooltip(true), 50)
					}}
					onMouseLeave={() => showTooltip(false)}
				>
					{`${score}(${words.length})`}
				</span>
			</div>)
		})
		return marks
	}, [scoreCounts, tooltip])
			
	return (<>
		<div>
			<p>{`${filterName}(${bounds.min}, ${bounds.max})`}</p>
			<RangeSlider
				bounds={bounds}
				range={range}
				marks={marks}
				setRange={setRange}
				/>
		</div>
	</>);
}

export const WordRangeFilter = (prop:{
	type: FilterType,
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	const { scoreCounts, allowed, bounds, range, setRange } = useWordFilter(prop.words, prop.type)
	return (<WordRangeFilterImpl
		filterName={prop.type}
		words={prop.words}
		scoreCounts={scoreCounts}
		allowed={allowed}
		bounds={bounds}
		range={range}
		setRange={setRange}
		onResult={prop.onResult}
	/>);
}

export const WordFreqRangeFilter = (prop:{
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	return <WordRangeFilter
		type='freq'
		{...prop}
	/>
}

export const WordLengthRangeFilter = (prop:{
	words: Word[],
	onResult:(allowed: boolean[])=>void
}) => {
	return <WordRangeFilter
		type='length'
		{...prop}
	/>
}

