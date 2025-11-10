import React from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View
} from "react-native";

type NavbarProps = {
	title?: string;
	onLeftPress?: () => void;
	leftIcon?: React.ReactNode;
	rightIcons?: Array<{ key: string; node: React.ReactNode; onPress?: () => void }>;
	style?: any;
};

export default function Navbar({
	title = "",
	onLeftPress,
	leftIcon,
	rightIcons = [],
	style
}: NavbarProps) {
	// Default simple icons (puedes sustituir por vector icons si las tienes)
	const defaultLeft = <Text style={styles.iconText}>←</Text>;
	const defaultRight = <Text style={styles.iconText}>⋯</Text>;

	return (
		<View style={[styles.container, style]}>
			<Pressable
				accessibilityRole="button"
				onPress={onLeftPress}
				style={styles.leftButton}
				hitSlop={8}
			>
				{leftIcon ?? defaultLeft}
			</Pressable>

			<View style={styles.titleWrap}>
				<Text numberOfLines={1} style={styles.title}>
					{title}
				</Text>
			</View>

			<View style={styles.rightWrap}>
				{rightIcons.length === 0 ? (
					<Pressable style={styles.rightButton} onPress={() => {}}>
						{defaultRight}
					</Pressable>
				) : (
					rightIcons.map((it) => (
						<Pressable
							key={it.key}
							style={styles.rightButton}
							onPress={it.onPress}
							hitSlop={8}
						>
							{it.node}
						</Pressable>
					))
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 64,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		backgroundColor: "#fff",
		// Sombra ligera: iOS & Android
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 4,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(0,0,0,0.06)"
	},
	leftButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10
	},
	rightWrap: {
		width: 88,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 6
	},
	rightButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10
	},
	titleWrap: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 8
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827"
	},
	iconText: {
		fontSize: 18,
		color: "#0f4c81"
	}
});