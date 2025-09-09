import React from "react";
import type { ShoppingItem } from "../state/store";

type Props = {
	items: ShoppingItem[];
	onRemove: (name: string) => void;
};

export function ShoppingList({ items, onRemove }: Props) {
	const grouped = React.useMemo(() => {
		const map: Record<string, ShoppingItem[]> = {};
		for (const it of items) {
			map[it.category] ||= [];
			map[it.category].push(it);
		}
		return map;
	}, [items]);

	return (
		<div style={{ display: "grid", gap: 12 }}>
			{Object.entries(grouped).map(([cat, list]) => (
				<div key={cat}>
					<div style={{ fontWeight: 600, opacity: 0.7, marginBottom: 6 }}>{cat}</div>
					{list.map((it) => (
						<div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid #eee", borderRadius: 10 }}>
							<div>
								<div style={{ fontWeight: 600 }}>{it.name}</div>
								<div style={{ fontSize: 12, opacity: 0.8 }}>qty: {it.quantity}</div>
							</div>
							<button onClick={() => onRemove(it.name)} style={{ border: "none", background: "#f6f6f6", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>Remove</button>
						</div>
					))}
				</div>
			))}
		</div>
	);
}

