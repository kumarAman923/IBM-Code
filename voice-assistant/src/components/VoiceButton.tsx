import React from "react";

type Props = {
	status: "idle" | "listening" | "error";
	onStart: () => void;
	onStop: () => void;
};

export function VoiceButton({ status, onStart, onStop }: Props) {
	return (
		<button
			aria-label="Toggle voice listening"
			onClick={status === "listening" ? onStop : onStart}
			style={{
				padding: "12px 16px",
				borderRadius: 12,
				border: "1px solid #ccc",
				background: status === "listening" ? "#ffefef" : "white",
				color: "#333",
				cursor: "pointer",
			}}
		>
			{status === "listening" ? "Stop Listening" : "Start Voice"}
		</button>
	);
}

