import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if (process.env.PUBLIC_URL) {
	{
		const script = document.createElement('script')
		script.async = true
		script.src = 'https://www.googletagmanager.com/gtag/js?id=G-W578WY8ME0'
		document.head.appendChild(script)
	}
	{
		const script = document.createElement('script')
		script.innerHTML =
`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-W578WY8ME0');`
		document.head.appendChild(script)
	}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<App />
)
