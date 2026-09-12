import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { fetchMedCard, fetchMedCardList, SavedMedCardsLists } from '../lib/api';
import { colors, spacing, fontSize, radius } from '../theme';
import { ScrollView } from 'react-native';

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

    if (isLoading) return <ActivityIndicator />;

    return <View style={styles.container}>
        <FlatList
            data={cardlist}  // The array -- in this case the 'cardlist'
            keyExtractor={(item, index) => item.id.toString()}  // function that answers: given one item, what's its unique id? -- read it as 'hand me an item, I'll hand you one back'. 
            renderItem={({ item }) => <Text>{item.title}</Text>}
        />
    </View>
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.xl
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.sm,
    width: 250,
    marginBottom: spacing.sm,
  },
});
