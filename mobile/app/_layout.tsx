// Import the stack from 'expo-router'.
import { Stack } from 'expo-router';
// Export a default function called a RootLayout.
export default function RootLayout() {
    return (
        // user 'screenOptions={{ headerShown: false }} to get rid of the all the ugly titles.
        <Stack screenOptions={{ headerShown: false}}> 
            <Stack.Screen name="index" options={{ title: "Home"}} />
        </Stack>
    );
}