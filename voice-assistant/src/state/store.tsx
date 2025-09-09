import React, { createContext, useContext, useMemo, useReducer } from "react";

export type ShoppingItem = {
	id: string;
	name: string;
	quantity: number;
	category: string;
	note?: string;
};

type ShoppingState = {
	items: ShoppingItem[];
	history: string[]; // previously added item names for suggestions
};

type Action =
	| { type: "ADD_ITEM"; payload: { name: string; quantity?: number; note?: string } }
	| { type: "REMOVE_ITEM"; payload: { name: string } }
	| { type: "UPDATE_ITEM"; payload: { name: string; quantity?: number; note?: string } }
	| { type: "SET_HISTORY"; payload: { history: string[] } }
	| { type: "RESET" };

const initialState: ShoppingState = {
	items: [],
	history: [],
};

function normalizeName(name: string): string {
	return name.trim().toLowerCase();
}

function reducer(state: ShoppingState, action: Action): ShoppingState {
	switch (action.type) {
		case "ADD_ITEM": {
			const quantity = Math.max(1, action.payload.quantity ?? 1);
			const name = normalizeName(action.payload.name);
			const existing = state.items.find((it) => it.name === name);
			if (existing) {
				const updated: ShoppingItem = { ...existing, quantity: existing.quantity + quantity };
				return {
					...state,
					items: state.items.map((it) => (it.id === existing.id ? updated : it)),
					history: Array.from(new Set([name, ...state.history])).slice(0, 200),
				};
			}
			const category = categorize(name);
			const newItem: ShoppingItem = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				name,
				quantity,
				category,
				note: action.payload.note,
			};
			return {
				...state,
				items: [...state.items, newItem],
				history: Array.from(new Set([name, ...state.history])).slice(0, 200),
			};
		}
		case "REMOVE_ITEM": {
			const name = normalizeName(action.payload.name);
			return { ...state, items: state.items.filter((it) => it.name !== name) };
		}
		case "UPDATE_ITEM": {
			const name = normalizeName(action.payload.name);
			return {
				...state,
				items: state.items.map((it) =>
					it.name === name
						? {
							...it,
							quantity: action.payload.quantity ?? it.quantity,
							note: action.payload.note ?? it.note,
						}
						: it
				),
			};
		}
		case "SET_HISTORY": {
			return { ...state, history: action.payload.history };
		}
		case "RESET":
			return initialState;
		default:
			return state;
	}
}

function categorize(name: string): string {
	// Basic categorization heuristic
	const n = name.toLowerCase();
	if (/milk|yogurt|cheese|butter|cream/.test(n)) return "dairy";
	if (/apple|banana|orange|lettuce|tomato|spinach|berry|grape|onion|potato/.test(n)) return "produce";
	if (/bread|bagel|tortilla|bun|loaf|baguette/.test(n)) return "bakery";
	if (/chicken|beef|pork|fish|turkey|tofu/.test(n)) return "protein";
	if (/rice|pasta|noodle|cereal|oat|flour|sugar/.test(n)) return "pantry";
	if (/water|soda|juice|coffee|tea|wine|beer/.test(n)) return "beverages";
	if (/chips|cookie|snack|candy|chocolate|cracker/.test(n)) return "snacks";
	if (/soap|shampoo|toothpaste|detergent|tissue|paper towel|toilet paper/.test(n)) return "household";
	return "other";
}

type StoreContextType = {
	state: ShoppingState;
	dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, undefined, () => {
		try {
			const raw = localStorage.getItem("shopping_state_v1");
			if (raw) return JSON.parse(raw) as ShoppingState;
		} catch {}
		return initialState;
	});

	const value = useMemo(() => ({ state, dispatch }), [state]);

	React.useEffect(() => {
		try {
			localStorage.setItem("shopping_state_v1", JSON.stringify(state));
		} catch {}
	}, [state]);

	return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
	const ctx = useContext(StoreContext);
	if (!ctx) throw new Error("useStore must be used within StoreProvider");
	return ctx;
}

