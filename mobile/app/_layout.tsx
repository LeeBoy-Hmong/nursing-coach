// Import the stack from 'expo-router'.
import { Stack } from 'expo-router';
// Export a default function called a RootLayout.
export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Home"}} />
        </Stack>
    );
}