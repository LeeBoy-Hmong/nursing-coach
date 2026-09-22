// tap should show the actual drug, dose, route, effects and all the other fields not just the card ID.
// Currently, when you tap on card in MedicalCards.tsx the card leads to a child page that's just the ID. 

import { useState, useEffect, useCallback } from 'react';
import { fetchMedCard } from '../lib/api';
import { ActivityIndicator, ScrollView, StyleSheet, View, Text } from 'react-native'
import { colors, spacing, radius, fontSize, shadow } from '../theme'
import { fetchMedCardID } from '../lib/api';
import { SavedMedCards } from '../lib/api';  // we're going to be pulling medical_cards to represent our cards.


interface MedicalCardProps {
    cardId : string
}

export function MedicalCardDetails({ cardId }: MedicalCardProps) {
    // Set the states.
    const [card, setCard] = useState<SavedMedCards | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Set a variable to load the card using useCallback(async () => ) with is a hook for child pages. See's the change and build a new loadCard.
    const loadCard = useCallback(async () => {
        // Set error to null first -- clear out any error left from a previous attempt.
        setError(null);
         // loading is true initinally already, so it doesn't need to be here -- here for pull-to-refresh later.
        setIsLoading(true); 
        // Hit a try statement to fetch 'fetchMedCardId()' pass cardID as an argument. then set the card.
        try {
            const data = await fetchMedCardID(cardId)
            setCard(data)
        // catch any error -- if there is an error, then 'the card can not be loaded'.
        } catch (e) {
            setError('The card can not be loaded. Please try again later.')
        // finally set the loading to false.
        } finally {
            setIsLoading(false)
        }
        // run [cardID] as the second argument for useCallback.
    }, ([cardId])
    );
    // The effect runs after the first paint, not during it. So the user sees the spinner immediately, then the data arrives.
    // Set a useEffect function to set the trigger -- firing the fetch 'On Mount' or whenever the cardId changes.
    useEffect(() => {
        loadCard();
    }, [loadCard]);
    // Set up the guards -- Loading, then error, then missing.
    // if (isLoading) -- is used if the app is still waiting on the server. Shows a spinner.
    if (isLoading) {
        return(
            <View style={styles.screen}>
                <ActivityIndicator size= 'large' color={colors.blue}></ActivityIndicator>
            </View>
        )
    }
    // if (error)  -- is used to send a request back if it comes back broken. Shows a message.
    if (error) {
        return (
            <View style={styles.screen}>
                <Text style={styles.error}>{error}</Text>
            </View>
        )
    }
    // if (!card) -- is used to state that, whatever card you are looking for, it's not there. should state "not found"
    if (!card) {
        return (
            <View style={styles.screen}>
                <Text style={styles.error}> There is no Card!</Text>
            </View>
        )
    }
    // Create a variable to view a card. use "medical_cards" from SaveMedCards. Remember, it is allowed to be null -- so, if it does come up empty. Our if statement guardrail above will catch it.
    const medicalCard = card.medical_card
    // 'if' statement for the variable (!__) -- run and error and text if don't see anything.
    if (!medicalCard) {
        return (
        <View style={styles.screen}>
            <Text style={styles.error}>There is no card here.{error}</Text>
        </View>
        )
    }
    // Use ScrollView to create the page -- have the inner canvas be a card. Pull the generic name, brandname, and topic. Only if they're not null.
    return (
        <ScrollView style={styles.outerWrapper}>
            <View style={styles.formCard}>
            {medicalCard.brand_name ? <Text style={styles.canvasText}>{medicalCard.brand_name}</Text>: null}
            {medicalCard.generic_name ? <Text style={styles.canvasText}>{medicalCard.generic_name}</Text>: null}
            {card.topic ? <Text style={styles.canvasText}>{card.topic}</Text> : null}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background
    },
    outerWrapper: {
        flex: 1,
        backgroundColor: colors.background
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
        ...shadow.card,
    },
    canvasText: {
        fontSize: fontSize.title,
        fontWeight: '500',
        color: colors.navy,
        borderColor: colors.white
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md
    },
    error: {
        color: colors.error,
        fontSize: fontSize.label
    }
})