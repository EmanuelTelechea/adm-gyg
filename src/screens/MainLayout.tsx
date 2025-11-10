import React from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import Navbar from "../components/Navbar";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function MainLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const colors = {
		background: isDark ? "#0b1220" : "#f6f7fb",
		card: isDark ? "#0f1724" : "#ffffff",
		text: isDark ? "#e6eef8" : "#111827",
		accent: "#0f4c81"
	};

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
			<Navbar
				title="Panel principal"
				onLeftPress={() => {
					// ejemplo: abrir drawer o volver
					console.log("left pressed");
				}}
				rightIcons={[
					{
						key: "search",
						node: (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Buscar"
								hitSlop={8}
								onPress={() => console.log("search")}
								style={({ pressed }) => [
									styles.iconButton,
									pressed && styles.iconPressed
								]}
							>
								<Text style={[styles.iconText, { color: colors.accent }]}>🔍</Text>
							</Pressable>
						),
						onPress: undefined
					},
					{
						key: "profile",
						node: (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Perfil"
								hitSlop={8}
								onPress={() => console.log("profile")}
								style={({ pressed }) => [
									styles.iconButton,
									pressed && styles.iconPressed
								]}
							>
								<Text style={[styles.iconText, { color: colors.accent }]}>👤</Text>
							</Pressable>
						),
						onPress: undefined
					}
				]}
			/>

			<View style={[styles.content, { backgroundColor: colors.background }]}>
				<View style={[styles.card, { backgroundColor: colors.card }]}>
					<Text style={[styles.h1, { color: colors.text }]}>Bienvenido</Text>
					<Text style={[styles.p, { color: colors.text }]}>
						Resumen rápido del panel. Aquí puedes ver tus métricas y acceder a funciones
						importantes.
					</Text>
				</View>

				{/* ...existing code... */}
			</View>

			<StatusBar style={isDark ? "light" : "dark"} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1 },
	content: { flex: 1, padding: 16 },
	card: {
		borderRadius: 12,
		padding: 16,
		// sombra ligera compatible iOS/Android
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 6,
		marginBottom: 12
	},
	h1: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
	p: { fontSize: 14, lineHeight: 20, opacity: 0.9 },
	iconButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10
	},
	iconPressed: {
		opacity: 0.7
	},
	iconText: {
		fontSize: 18
	}
});