import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function MedCardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Card id: {id}</Text>;
}
