import { useMemo } from 'react'
import Select, { StylesConfig } from 'react-select';

type Props = {
	items: string[]
	selection?: string,
	onChange: (result: string) => void
	styles?: StylesConfig
}

const FilterList = ({
	items,
	selection,
	onChange,
	styles
}: Props) => {
	const options = useMemo(() => items.map(v=>({value:v, label:v})), [items])

	return (<>
		<Select
			isSearchable
			onChange={(v:{value:string,label:string})=>onChange(v.value)}
			options={options}
			value={{value:selection, label:selection}}
			styles={styles}
		/>
	</>)
}
export default FilterList