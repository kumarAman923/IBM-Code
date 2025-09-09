import { useEffect, useMemo, useRef, useState } from "react";
import type { ParsedIntent } from "../nlp/intent";
import { parseIntent } from "../nlp/intent";
import franc from "franc";

declare global {
	interface Window {
		annyang?: any;
	}
}

export type VoiceStatus = "idle" | "listening" | "error";

export function useVoice(onIntent: (intent: ParsedIntent, utterance: string) => void) {
	const [status, setStatus] = useState<VoiceStatus>("idle");
	const [lastTranscript, setLastTranscript] = useState<string>("");
	const supported = typeof window !== "undefined" && !!window.SpeechRecognition;
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (!SR) return;
		const recognition: SpeechRecognition = new SR();
		recognition.lang = navigator.language || "en-US";
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.onstart = () => setStatus("listening");
		recognition.onerror = () => setStatus("error");
		recognition.onend = () => setStatus("idle");
		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let transcript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const res = event.results[i];
				if (res.isFinal) transcript += res[0].transcript;
			}
			if (transcript) {
				setLastTranscript(transcript);
				const langCode = franc(transcript, { minLength: 3 });
				// TODO: map language code to SR lang if needed
				const intent = parseIntent(transcript);
				onIntent(intent, transcript);
			}
		};
		recognitionRef.current = recognition;
		return () => {
			recognition.stop();
			recognitionRef.current = null;
		};
	}, [onIntent]);

	const api = useMemo(
		() => ({
			start: () => recognitionRef.current?.start(),
			stop: () => recognitionRef.current?.stop(),
			status,
			lastTranscript,
			supported,
		}),
		[status, lastTranscript, supported]
	);

	return api;
}

