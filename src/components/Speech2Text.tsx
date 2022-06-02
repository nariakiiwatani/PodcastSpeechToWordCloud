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
		onResult: (text: string) => void;
		onError: (err: any) => void;
}) => {
	const { onResult, onError } = prop
	const [recognizer, setRecognizer] = useState<KaldiRecognizer>()
	const [utterances, setUtterances] = useState<VoskResult[]>([]);
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
		const thismodel = await loadModel()
		const file = e?.target?.files && e.target.files.length > 0 ? e.target.files[0] : null;
		if (!file) {
			return
		}
		const reader = new FileReader();
		reader.onload = async () => {
			const audioCtx = new AudioContext();
			const buffer = await audioCtx.decodeAudioData(reader.result as ArrayBuffer)	
			const sampleRate = buffer.sampleRate;
			const recognizer = new thismodel.KaldiRecognizer(sampleRate);
			setRecognizer(recognizer)
			recognizer.setWords(true);
			recognizer.on("result", (message: any) => {
				const result: VoskResult = message.result;
				if(result.text === '') {
					return
				}
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
		onResult(utterances.map(u=>u.text.replace(/\s/g, "")).join("\n"))
	}, [utterances])
	return (<>
		<input type='file'
			onChange={onChange}
		/>
	</>)
}
export default Speech2Text