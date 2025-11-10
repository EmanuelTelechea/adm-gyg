import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { fetchJson } from "../utils/fetchJson";

export default function CategoriesScreen() {
	const [categories, setCategories] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const data = await fetchJson("https://example.com/api/categories");
				if (!mounted) return;
				// Ensure we have an array
				setCategories(Array.isArray(data) ? data : []);
			} catch (e: any) {
				if (!mounted) return;
				setError(e?.message ?? "Error desconocido");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	if (loading) return <ActivityIndicator />;
	if (error)
		return (
			<View style={{ padding: 16 }}>
				<Text>Error al cargar categorías: {error}</Text>
			</View>
		);

	return (
		<FlatList
			data={categories}
			keyExtractor={(item, idx) => (item?.id ? String(item.id) : String(idx))}
			renderItem={({ item }) => <Text style={{ padding: 8 }}>{item?.name ?? String(item)}</Text>}
			ListEmptyComponent={<Text style={{ padding: 8 }}>No hay categorías</Text>}
		/>
	);
}