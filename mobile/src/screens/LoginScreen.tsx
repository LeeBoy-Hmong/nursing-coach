import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";
import { colors, spacing, fontSize, radius, fontType,  shadow } from "../theme"
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";


export default function LoginDisplay() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isSecure, setIsSecure] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null >(null)

    const router = useRouter()

    // Create a handler for logging in
    const signInHandler = async () => {
        // Check the inputs by create a guardrail.
        if (!email.trim() || !password.trim()) return;
        // Reset and start - flush lingering errors behind the previous authentication and then spin up isLoading right away.
        setError(null);
        setIsLoading(true);
        // Try and catch the call from supabase.
        try {
            const {error} = await supabase.auth.signInWithPassword({email, password});
                    // Check for an error manually -- Supabase client does not throw exceptions on standard auth -- have to check ourselves.
            if (error) {
                    setError(
                        error.message.includes("Invalid login")
                        ? "This username/email is not recognized or authorized."
                    :error.message
                );
                
                return;
            };
        // On success - if user exist, use router.replace to switch screens.
            router.replace("/")
        } catch (e) {
            setError("Could not reach the server")
        } finally {
            setIsLoading(false);
        };
    }
    return (
        <View style={styles.wrapper}>
            <View style={styles.loginContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter Username"
                  autoCapitalize="none"  // Ensures no capitalization is needed.
                  keyboardType="email-address"  // Ensures what is typed in is an email -- may remove later on when add usernames.
                  style={styles.input}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="password"
                  secureTextEntry={isSecure}
                  autoCapitalize="none"
                  style={styles.input}
                />
                {/*Add and error display block for unauthenticated login attempts*/}
                {error && (
                <View style={styles.errorbanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>)}

                <Pressable onPress={() => setIsSecure(!isSecure)} style={styles.toggleButton}>
                    <Text style={styles.toggleText}>{isSecure ? 'Show' : 'Hide'}</Text>
                </Pressable>
                <Pressable onPress={signInHandler} style={styles.submitButton}>
                    <Text style={styles.submitText}>Log in</Text>
                </Pressable>               
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.navy
    },
    loginContainer: {
        width: '100%',
        alignContent: 'center',
        maxWidth: 400, // Caps width on web/tablets
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: fontSize.title,
        color: colors.navy
    },
      input: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      backgroundColor: colors.white,
      color: colors.navy,
      fontSize: fontSize.body,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
      marginBottom: spacing.md,
    },
    toggleButton: {
      padding: spacing.md,
    },
    toggleText: {
     color: colors.blue,
     fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: colors.blue,
        borderRadius: 4,
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        alignSelf: 'center',
        width: 275
    },
    submitText: {
        color: colors.lightText,
        fontWeight: 'bold',
        margin: spacing.sm,
        alignContent: 'center',
    },
    errorbanner: {
        backgroundColor: '#ffebe9', // Light red background
        borderColor: '#ffc1bd',     // Subtle border line
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginBottom: 16,           // Spacing between error and button
        width: '100%',
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.label,
        textAlign: 'center',
        fontWeight: 'bold'
  },
})