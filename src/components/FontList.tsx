import { useMemo } from 'react'
import FilterList from './FilterList'
import { useFontList } from '../libs/FontList'

type Props = {
	selection?: string,
	onChange: (result: string) => void
}

const FontList = ({
	selection,
	onChange,
}: Props) => {
	const fontList = useFontList(selection)
	const styleFn = useMemo(() => ({
		option: (provided, state) => {
			return {
				...provided,
				fontFamily: state.data.label
			}
		},
		singleValue: (provided, state) => {
			return {
				...provided,
				fontFamily: state.data.label
			}
		},
	}), [])

	return (<>
		<FilterList
			items={fontList}
			selection={selection}
			onChange={onChange}
			styles={styleFn}
		/>
	</>)
}
export default FontList