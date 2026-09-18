import { useState, useEffect, useRef } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize, shadow} from '../theme'
import { BANNER_STATMENTS } from '../lib/statements'

export default function HomeScreen() {
    const [index, setIndex] = useState(0);
    // Create a variable for the opacity (1 means it's fully visible).
    const opacityAnim = useRef(new Animated.Value(1)).current;
    // Create a variable -- type the ref using ReturnType to match environment's setInterval hook.
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Start the native interval loop.
        timeout.current = setInterval(() => {
            // fade out the text opacity over 500ms with 'Animated.timing({})' -- pass the 'opacity' variable.
            Animated.timing(opacityAnim,{
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // Increase the current index by 1 -- if reaches the end of the statement array, start again at index 0.
                setIndex((prevIndex) => (prevIndex + 1 ) % BANNER_STATMENTS.length)
                // fade the text back in - same method ^ but this time "toValue:1".
                Animated.timing(opacityAnim,{
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start()
            });
        }, 5000);  // Return a cycle for every 3 seconds
        // Stop the timer when the component is removed from the screen.
        return () => {
            if (timeout.current) {
                clearInterval(timeout.current);
            }
        };
    }

    );
    return (
        <SafeAreaView style= {styles.screen}>
            <View style={styles.banner}>
                <View style={styles.brandRow}>
                    <Image
                        source={require('../../assets/nightingale.png')}
                        style={styles.logo}
                        resizeMode='contain'
                    />
                    <Text style={styles.wordmark}>Welcome</Text>
                </View>
                <Text style={styles.bannerTitle}>This is your Nurse Space</Text>
                <Animated.Text style={[styles.bannerSubtitle, { opacity: opacityAnim }]}>
                    {BANNER_STATMENTS[index]} 
                </Animated.Text>
            </View>

            <View style={styles.sheet}>
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Continue you Work</Text>
                </View>
                
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Placeholder 1</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Placeholder 2</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Placeholder 3</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.navy,
    },
    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },

    // ---- navy banner ----
    banner: {
        paddingTop: spacing.xl + spacing.lg,   // leaves room for the status bar
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: spacing.sm,
    },
    wordmark: {
        fontSize: fontSize.brand,
        fontWeight: '700',
        color: colors.lightText,
    },
    bannerTitle: {
        fontSize: fontSize.title,
        fontWeight: '700',
        color: colors.lightText,
    },
    bannerSubtitle: {
        fontSize: fontSize.body,
        color: colors.subtitle,
        marginTop: spacing.xs,
    },

    // ---- rounded sheet ----
    sheet: {
        flex: 1,
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.md * 2,
        borderTopRightRadius: radius.md * 2,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },

    // ---- form card ----
    formCard: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
        ...shadow.card,
    },
    formTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: '700',
        color: colors.navy,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.label,
        fontWeight: '600',
        color: colors.navy,
        marginBottom: spacing.xs,
    },
    input: {
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

    // ---- primary button ----
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.blue,
        borderRadius: radius.sm,
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    },
    buttonDisabled: {
        opacity: 0.45,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonPlus: {
        fontSize: fontSize.subtitle,
        color: colors.white,
        lineHeight: fontSize.subtitle + 2,
    },
    buttonText: {
        fontSize: fontSize.button,
        fontWeight: '700',
        color: colors.white,
    },

    // ---- error ----
    errorBox: {
        backgroundColor: colors.errorSurface,
        borderRadius: radius.sm,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.label,
    },
    errorRetry: {
        color: colors.blueLink,
        fontSize: fontSize.label,
        fontWeight: '700',
        marginTop: spacing.xs,
    },

    // ---- section heading ----
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: '700',
        color: colors.navy,
    },
    sectionCount: {
        fontSize: fontSize.caption,
        color: colors.mutedText,
    },

    // ---- list rows ----
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadow.card,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        backgroundColor: colors.emerald + '22',   // '22' = ~13% opacity tint
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardIconGlyph: {
        fontSize: fontSize.subtitle,
        color: colors.greenLink,
    },
    cardTextBlock: {
        flex: 1,                                  // takes the leftover width so the chevron stays right
    },
    cardTitle: {
        fontSize: fontSize.body,
        fontWeight: '700',
        color: colors.navy,
    },
    cardSubtitle: {
        fontSize: fontSize.caption,
        color: colors.mutedText,
        marginTop: 2,
    },
    cardChevron: {
        fontSize: fontSize.title,
        color: colors.border,
        marginLeft: spacing.sm,
    },

    // ---- empty + footer ----
    emptyBox: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSize.body,
        fontWeight: '700',
        color: colors.navy,
    },
    emptyBody: {
        fontSize: fontSize.label,
        color: colors.mutedText,
        textAlign: 'center',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.lg,
    },
    disclaimer: {
        fontSize: fontSize.caption,
        color: colors.mutedText,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
});