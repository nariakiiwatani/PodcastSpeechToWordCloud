import { useState, useEffect, useMemo } from 'react'
import Select from 'react-select';

type Props = {
	items: string[]
	selection?: string,
	onChange: (result: string) => void
}

const FilterList = ({
	items,
	selection,
	onChange
}: Props) => {
	const options = useMemo(() => items.map(v=>({value:v, label:v})), [items])

	return (<>
		<Select
			isSearchable
			onChange={v=>onChange(v.value)}
			options={options}
			value={{value:selection, label:selection}}
		/>
	</>)
}
export default FilterList