import React from 'react';
import './App.css';
import MyWordCloud from './components/MyWordcloud';

function App() {
	const [text, setText] = React.useState('あいうえお かきくけこ かきくけこ')
	return (
		<div className="App">
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<MyWordCloud text={text} />
		</div>
	);
}

export default App;
