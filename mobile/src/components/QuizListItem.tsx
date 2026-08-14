// Import Text from 'react-native'
import { Text, Pressable } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

// Adding the functions props interface
interface QuizListItemProps {
title: string;
onTap: () => void; // Takes in no arguments and returns nothing.
}

// export a 'default function' return a Text statement.
export default function QuizListItem({ title, onTap }: QuizListItemProps) {
    return (
        <Pressable onPress={onTap} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1}]}>
            <Text style={{ fontSize: fontSize.lg, padding: 15, borderBottomWidth: 1, borderColor: '#ccc' }}>{title}</Text>
        </Pressable>
    )
};
