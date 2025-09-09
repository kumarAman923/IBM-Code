import React from "react";
import type { Suggestion } from "../suggestions/suggest";

export function Suggestions({ suggestions }: { suggestions: Suggestion[] }) {
	if (!suggestions.length) return null;
	return (
		<div style={{ marginTop: 12 }}>
			<div style={{ fontWeight: 600, marginBottom: 8 }}>Suggestions</div>
			<div style={{ display: "grid", gap: 8 }}>
				{suggestions.map((s, idx) => (
					<div key={idx} style={{ fontSize: 14, background: "#f9fafb", border: "1px solid #eef2f7", padding: "8px 10px", borderRadius: 10 }}>
						{s.text}
					</div>
				))}
			</div>
		</div>
	);
}

