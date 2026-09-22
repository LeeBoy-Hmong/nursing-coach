import { useLocalSearchParams } from 'expo-router';
import { MedicalCardDetails } from '../../src/screens/MedicalCardDetail';
/**useLocalSearchParams acts like a digital sticky note for this screen.
 * WHAT IT DOES: 
 * It reads the parameters (like IDs, search filters, or names) passed into.
 * The URL/path from the previous screen so this screen knows exactly whatdata to fetch or display (e.g., loading a specific user profile or product).
 * KEY RULES:
 * Only triggers a re-render when changes specifically affect THIS screen.
 * All returned values are strings or arrays of strings (even numbers like '42').
 * @exampleconst { id, category } = useLocalSearchParams<{ id: string; category?: string }>();
 * */
export default function MedCardRoute() {
  // Create variable to pull the id from the URL parameters.
  const { id } = useLocalSearchParams<{ id: string }>();
  // Render the actual screen components from MedicalCardDetail file.
  return <MedicalCardDetails cardId={id} />;  // 'cardID' is the key from MedicalCardDetail page.
}
