import { useState, useCallback } from 'react'
import Switch from "react-switch";

type Props = {
	title: string,
	canToggleOpen?: boolean,
	defaultOpen: boolean,
	showSwitch: boolean,
	defaultEnable?: boolean,
	children: React.ReactNode,
	className: string,
	titleClass: string,
	onChangeEnabled?: (enabled: boolean) => void,
}

const TreeNode = ({
	title,
	canToggleOpen=true,
	defaultOpen,
	showSwitch,
	defaultEnable=true,
	children,
	className,
	titleClass,
	onChangeEnabled
}:Props) => {
	const [open, setOpen] = useState(defaultOpen)
	const [enable, setEnable] = useState<boolean>(defaultEnable)
	const toggle = useCallback(() => {
		setOpen(!open)
	}
	, [open])
	const handleEnable = useCallback((checked:boolean) => {
		setEnable(checked)
		onChangeEnabled && onChangeEnabled(checked)
	}, [enable])
	return (<>
		<div className={className}>
			<div>
				{canToggleOpen ? (
				<span
					className={titleClass}
					onClick={toggle}
				>
					{open ? '▼' : '▶︎' } {title}
				</span>) : (
				<span className={titleClass}>{title}</span>)}
				<div className={styles.right}>
					{showSwitch && <Switch
						onChange={handleEnable}
						checked={enable}
						width={40}
						height={20}
					/>}
				</div>
			</div>
			<div
				className={`${!enable ? styles.disabled:''} ${!open ? styles.hidden:''}`}
			>
				{children}
			</div>
		</div>
	</>)
}

export default TreeNode

const styles = {
	right: `
	float-right
	`,
	disabled: `
	pointer-events-none
	select-none
	opacity-50
	`,
	hidden: `
	hidden
	`,
}