import React from 'react';
import './App.css';
import MyWordCloud from './components/MyWordcloud';
import Speech2Text from './components/Speech2Text';

function App() {
	const [text, setText] = React.useState('あいうえお かきくけこ かきくけこ')
	return (
		<div className="App">
			<Speech2Text
				onResult={setText}
				onError={console.error} />
			
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<MyWordCloud text={text} />
		</div>
	);
}

export default App;
