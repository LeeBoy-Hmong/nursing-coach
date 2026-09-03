import {View, Text, FlatList } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';  // The tappable modules that allow switching between URL

// Create an exportable function RecipeList()
export default function RecipeList() {
    const recipes = [
        { id: '1', name: 'Carbonara'},
        { id: '2', name: 'Heath'},
    ];

    return (
        <View>
            {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/medcards/${recipe.id}`}>
                    <Text>{recipe.name}</Text>
                </Link>
            ))}
        </View>
    )
}