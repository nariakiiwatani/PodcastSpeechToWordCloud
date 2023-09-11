import { useState, useCallback } from 'react'
import Switch from "react-switch";

type Props = {
	title: string,
	canToggleOpen?: boolean,
	defaultOpen: boolean,
	showSwitch: boolean,
	enabled?: boolean,
	children: React.ReactNode,
	className: string,
	titleClass: string,
	setEnabled?: (enabled: boolean) => void,
}

const TreeNode = ({
	title,
	canToggleOpen=true,
	defaultOpen,
	showSwitch,
	enabled=true,
	children,
	className,
	titleClass,
	setEnabled
}:Props) => {
	const [open, setOpen] = useState(defaultOpen)
	const toggle = useCallback(() => {
		setOpen(!open)
	}
	, [open])
	const handleEnable = useCallback((checked:boolean) => {
		setEnabled&&setEnabled(checked)
	}, [])
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
						checked={enabled}
						width={40}
						height={20}
					/>}
				</div>
			</div>
			<div
				className={`${!enabled ? styles.disabled:''} ${!open ? styles.hidden:''}`}
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