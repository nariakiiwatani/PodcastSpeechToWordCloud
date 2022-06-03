import { useEffect, useState } from 'react';
import { createModel, KaldiRecognizer, Model } from 'vosk-browser'

interface VoskResult {
	result: Array<{
	  conf: number;
	  start: number;
	  end: number;
	  word: string;
	}>;
	text: string;
  }
  
const MODEL_PATH = "models/vosk-model-small-ja-0.22.zip"
const Speech2Text = (prop: {
	onSentence?: (text: string) => void;
	onResult?: (text: string) => void;
	onError: (err: any) => void;
}) => {
	const { onSentence, onResult, onError } = prop
	const [recognizer, setRecognizer] = useState<KaldiRecognizer>()
	const [utterances, setUtterances] = useState<VoskResult[]>([]);
	const [timelineMax, setTimelineMax] = useState(0);
	const [audioDutation, setAudioDutation] = useState(0);
	const [model, setModel] = useState<Model>();
	const loadModel = async () => {
		const model = await createModel(MODEL_PATH);
		setModel(model);
		return model;
	}

	const onChange = async (e:React.ChangeEvent<HTMLInputElement>) => {
		if(model && recognizer) {
			model.unregisterRecognizer(recognizer.id)
			setRecognizer(null)
		}
		setUtterances([])
		setTimelineMax(0)
		setAudioDutation(0)
		const thismodel = await loadModel()
		const file = e?.target?.files && e.target.files.length > 0 ? e.target.files[0] : null;
		if (!file) {
			return
		}
		const reader = new FileReader();
		reader.onload = async () => {
			const audioCtx = new AudioContext();
			const buffer = await audioCtx.decodeAudioData(reader.result as ArrayBuffer)	
			setAudioDutation(buffer.duration)

			const sampleRate = buffer.sampleRate;
			const recognizer = new thismodel.KaldiRecognizer(sampleRate);
			setRecognizer(recognizer)
			recognizer.setWords(true);
			recognizer.on("result", (message: any) => {
				const result: VoskResult = message.result;
				if(result.text === '') {
					return
				}
				setTimelineMax(prev => Math.max(prev, result.result.reduce((prev, cur) => Math.max(prev, cur.end), 0)))
				onSentence && onSentence(result.text.replace(/\s/g, ""))
				setUtterances((utt: VoskResult[]) => [...utt, result]);
			})
			recognizer.on("error", onError)

			const chunkDuration = 0.1
			const chunkSize = sampleRate * chunkDuration;
			const chunks = Math.ceil(buffer.length / chunkSize);
			const tmp = new Float32Array(chunkSize);
			for (let i = 0; i < chunks; i++) {
				buffer.copyFromChannel(tmp, 0, i * chunkSize);
				recognizer.acceptWaveformFloat(tmp, sampleRate)
			}
		};
		reader.readAsArrayBuffer(file);
	}
	useEffect(() => {
		onResult && onResult(utterances.map(u=>u.text.replace(/\s/g, "")).join("\n"))
	}, [utterances])
	const seconds2Str = (seconds: number, padding:number=2) => {
		const h = Math.floor(seconds / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		const s = Math.floor(seconds % 60)
		const pad = (n: number) => ('0' + n).slice(-padding)
		return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
	}
	return (<>
		<input type='file'
			onChange={onChange}
		/>
		{(timelineMax > 0 || audioDutation > 0) && 
			<p>処理済み : {`${seconds2Str(timelineMax)}/${seconds2Str(audioDutation)}`}</p>
		}
	</>)
}
export default Speech2Text