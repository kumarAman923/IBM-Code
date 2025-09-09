import type { ShoppingItem } from "../state/store";

const seasonalByMonth: Record<number, string[]> = {
	1: ["citrus", "kale", "leek"],
	2: ["citrus", "broccoli"],
	3: ["asparagus", "strawberries"],
	4: ["asparagus", "spinach"],
	5: ["berries", "cherries"],
	6: ["watermelon", "tomatoes"],
	7: ["corn", "peaches"],
	8: ["plums", "tomatoes"],
	9: ["apples", "squash"],
	10: ["pumpkin", "sweet potato"],
	11: ["cranberries", "brussels sprouts"],
	12: ["citrus", "greens"],
};

const substitutes: Record<string, string[]> = {
	milk: ["almond milk", "oat milk", "soy milk"],
	bread: ["bagel", "tortilla"],
	egg: ["egg substitute", "tofu"],
	sugar: ["honey", "maple syrup"],
};

export type Suggestion = { type: "history" | "seasonal" | "substitute"; text: string };

export function getSuggestions(items: ShoppingItem[], history: string[], lastMention?: string): Suggestion[] {
	const suggestions: Suggestion[] = [];

	// history-based (recent items not in list)
	for (const name of history.slice(0, 10)) {
		if (!items.some((i) => i.name === name)) {
			suggestions.push({ type: "history", text: `You often buy ${name}. Need it?` });
		}
	}

	// seasonal
	const m = new Date().getMonth() + 1;
	for (const item of seasonalByMonth[m] || []) {
		if (!items.some((i) => i.name.includes(item))) {
			suggestions.push({ type: "seasonal", text: `${item} is in season.` });
		}
	}

	// substitutes if last mentioned is unavailable
	if (lastMention) {
		const key = Object.keys(substitutes).find((k) => lastMention.toLowerCase().includes(k));
		if (key) {
			for (const alt of substitutes[key]) {
				suggestions.push({ type: "substitute", text: `Consider ${alt} as an alternative.` });
			}
		}
	}

	return suggestions.slice(0, 6);
}

