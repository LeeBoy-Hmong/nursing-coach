import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { colors, spacing, fontSize, radius, shadow } from "../theme"

export default function LoginDisplay() {
    return (
        <View style={styles.container}>
            <View></View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.navy

    }
})