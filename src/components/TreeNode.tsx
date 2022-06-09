import { useState, useCallback } from 'react'
import Switch from "react-switch";

type Prop = {
	title: string,
	defaultOpen: boolean,
	showSwitch: boolean,
	defaultEnable: boolean,
	children: React.ReactNode,
	className: string,
	titleClass: string,
	onChangeEnabled: (enabled: boolean) => void,
}

const TreeNode = (prop:Prop) => {
	const { title, defaultOpen, showSwitch, defaultEnable, children, className, titleClass, onChangeEnabled } = prop
	const [open, setOpen] = useState(defaultOpen)
	const [enable, setEnable] = useState(defaultEnable)
	const toggle = useCallback(() => {
		setOpen(!open)
	}
	, [open])
	const handleEnable = useCallback((checked:boolean) => {
		setEnable(checked)
		onChangeEnabled(checked)
	}, [enable])
	return (<>
		<div className={className}>
			<div>
				<span
					className={titleClass}
					onClick={toggle}
				>
					{open ? '▼' : '▶︎' } {title}
				</span>
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