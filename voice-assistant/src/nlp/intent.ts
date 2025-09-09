import nlp from "compromise";

export type IntentType =
	| "ADD_ITEM"
	| "REMOVE_ITEM"
	| "UPDATE_QUANTITY"
	| "SEARCH_ITEM"
	| "UNKNOWN";

export type ParsedIntent = {
	type: IntentType;
	item?: string;
	quantity?: number;
	filters?: { brand?: string; maxPrice?: number; minPrice?: number };
};

const numberWords: Record<string, number> = {
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
};

function extractNumber(text: string): number | undefined {
	const digits = text.match(/\b(\d+)\b/);
	if (digits) return parseInt(digits[1], 10);
	for (const [word, value] of Object.entries(numberWords)) {
		if (new RegExp(`\\b${word}\\b`).test(text)) return value;
	}
	return undefined;
}

export function parseIntent(text: string): ParsedIntent {
	const doc = nlp(text.toLowerCase());
	const normalized = doc.text();

	// price filters
	const maxPriceMatch = normalized.match(/under\s*\$?(\d+(?:\.\d+)?)/);
	const minPriceMatch = normalized.match(/over\s*\$?(\d+(?:\.\d+)?)/);

	const quantity = extractNumber(normalized);

	// intents
	if (/^(add|buy|get|need|pick up|want to buy)/.test(normalized)) {
		const item = doc.nouns().toSingular().text().replace(/^(add|buy|get|need|pick up|want to buy)\s+/, "").trim();
		return { type: "ADD_ITEM", item, quantity };
	}
	if (/^(remove|delete|drop|take off)/.test(normalized)) {
		const item = normalized.replace(/^(remove|delete|drop|take off)\s+/, "").trim();
		return { type: "REMOVE_ITEM", item };
	}
	if (/^(update|change|set)/.test(normalized) && /quantity|amount|number/.test(normalized)) {
		const item = doc.nouns().toSingular().text();
		return { type: "UPDATE_QUANTITY", item, quantity };
	}
	if (/^(find|search|look for|show me)/.test(normalized)) {
		const item = normalized.replace(/^(find|search|look for|show me)\s+/, "").replace(/\s+under.*$/, "").trim();
		return {
			type: "SEARCH_ITEM",
			item,
			filters: {
				maxPrice: maxPriceMatch ? parseFloat(maxPriceMatch[1]) : undefined,
				minPrice: minPriceMatch ? parseFloat(minPriceMatch[1]) : undefined,
			},
		};
	}

	return { type: "UNKNOWN" };
}

