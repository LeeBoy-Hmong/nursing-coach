import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { fetchMedCard, fetchMedCardList, SavedMedCardsLists } from '../lib/api';
import { colors, spacing, fontSize, radius, shadow } from '../theme';

export default function MedicalCards() {
    const router = useRouter();
    // Create the state Declarations
    const [cardlist, setCardList] = useState<SavedMedCardsLists[]>([]);
    // Create the inputs for the fetchMedCards -- it'll take in two parameters, so set two declaratives.
    const [drugName, setDrugName] = useState<string>("");
    const [drugTopic, setDrugTopic] = useState<string>("");
    // Declaratives for default of an app.
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);  // Starts False then later becomes'true' when it needs to refresh.
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false)

    // Wrap my fetch logic with useCallBack
    const fetchMedCards = useCallback(async () => {
        setError(null);

        try {
            setCardList(await fetchMedCardList());
        } catch (e) {
            setError('Medical list cannot load. Please try again later.')
        } finally {
            setIsLoading(false);
            setRefresh(false);
        }
    } , []);

    useEffect(() => {
        fetchMedCards();  // Run the callback used above.
    }, [fetchMedCards]);

    async function createMedCards() {
        setSubmitting(true);
        setError(null);
        try {
            const create = await fetchMedCard(drugName, drugTopic)
            router.push(`/medcards/${create.id}`)  // changes to which screen we look at. '.push' is go to a new screen and stack it on top of this current one.
        } catch (e) {
            setError("Your medical card can not be created.")
        } finally {
            setSubmitting(false);
        }
    }

    // First load only -- centered on the page background so it doesn't flash white.
    if (isLoading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color={colors.blue} />
            </View>
        );
    }

    // Button is dead until there's a drug name to submit.
    const canSubmit = !submitting && drugName.trim().length > 0;

    return (
        <View style={styles.screen}>
            {/* Navy banner: logo, wordmark, tagline. Sits behind the rounded sheet below. */}
            <View style={styles.banner}>
                <View style={styles.brandRow}>
                    <Image
                        source={require('../../assets/nightingale.png')}
                        style={styles.logo}
                        resizeMode='contain'
                    />
                    <Text style={styles.wordmark}>MedCard</Text>
                </View>
                <Text style={styles.bannerTitle}>Your medication study space</Text>
                <Text style={styles.bannerSubtitle}>Create a card. Keep learning.</Text>
            </View>

            {/* The rounded sheet overlapping the banner holds everything scrollable. */}
            <View style={styles.sheet}>
                <FlatList
                    data={cardlist}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={() => { setRefresh(true); fetchMedCards(); }}
                            tintColor={colors.blue}
                        />
                    }

                    // Keeps the form and section heading locked to the top of the scroll list
                    ListHeaderComponent={
                        <View>
                            {/* White form card */}
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>Create a medication card</Text>

                                <Text style={styles.label}>Medication name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Metoprolol"
                                    placeholderTextColor={colors.placeholder}
                                    value={drugName}
                                    onChangeText={setDrugName}
                                    editable={!submitting}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />

                                <Text style={styles.label}>Study focus (optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Nursing considerations"
                                    placeholderTextColor={colors.placeholder}
                                    value={drugTopic}
                                    onChangeText={setDrugTopic}
                                    editable={!submitting}
                                    returnKeyType="done"
                                    onSubmitEditing={createMedCards}
                                />

                                <Pressable
                                    onPress={createMedCards}
                                    disabled={!canSubmit}
                                    style={({ pressed }) => [
                                        styles.button,
                                        !canSubmit && styles.buttonDisabled,
                                        pressed && canSubmit && styles.buttonPressed,
                                    ]}
                                >
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color={colors.white} />
                                            <Text style={styles.buttonText}>Looking up FDA label…</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.buttonPlus}>+</Text>
                                            <Text style={styles.buttonText}>Create card</Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>

                            {/* Error sits between the form and the list so it's visible after either action */}
                            {error ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                    <Pressable onPress={fetchMedCards}>
                                        <Text style={styles.errorRetry}>Try again</Text>
                                    </Pressable>
                                </View>
                            ) : null}

                            {/* Section heading with a live count -- derived from the list, not stored */}
                            <View style={styles.sectionRow}>
                                <Text style={styles.sectionTitle}>My cards</Text>
                                <Text style={styles.sectionCount}>
                                    {cardlist.length} {cardlist.length === 1 ? 'card' : 'cards'}
                                </Text>
                            </View>
                        </View>
                    }

                    renderItem={({ item }) => (
                        <Link href={`/medcards/${item.id}`} asChild>
                            <Pressable style={styles.cardRow}>
                                <View style={styles.cardIcon}>
                                    <Text style={styles.cardIconGlyph}>℞</Text>
                                </View>
                                <View style={styles.cardTextBlock}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                    {item.topic ? (
                                        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.topic}</Text>
                                    ) : null}
                                </View>
                                <Text style={styles.cardChevron}>›</Text>
                            </Pressable>
                        </Link>
                        )
                    }

                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyTitle}>No cards yet</Text>
                            <Text style={styles.emptyBody}>
                                Enter a medication above to build your first study card.
                            </Text>
                        </View>
                    }

                    ListFooterComponent={
                        <Text style={styles.disclaimer}>
                            For learning • Check current references
                        </Text>
                    }
                />
            </View>
        </View>
    );
}

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
        backgroundColor: colors.emerald,
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
