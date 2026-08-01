import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, ScrollView, Pressable } from 'react-native';
import React, { useState } from 'react';
import { colors, spacing, fontSize, radius } from './src/theme';
import { fetchQuiz, Question } from './src/lib/api';

  // Defining the shape of my data. user 'interface' to build it out - similar to BaseModel in Pydantic.
  interface User {
    name: string;
    isLoggedIN: boolean;
  };

export default function App() {
  // Create states for given variables 
  const [user, setUser] = useState<User>({ name: "Michael", isLoggedIN: false });
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [nurseTopic, setNurseTopic] = useState<string>("");
  /* REVEAL STEP 1 — which answers are showing.
   * Indices only: [] = none, [0,3] = questions 1 and 4.
   * Separate from `quiz` because that's server data; this is UI state. */
  const [revealed, setRevealed] = useState<number[]>([]);

  // handler for logging in.
  function loggedIN() {
    setUser({ ...user, isLoggedIN: true });  // '...user' copies existing fields.
  }
  // handler for fetching the quizes from FastAPI.
async function getQuiz() {
  setLoading(true);
  setError("");
  try {
    setQuiz(await fetchQuiz(nurseTopic));
  } catch (e) {
    setError('Could not load the quiz. Please try again.');
  } finally {
    setLoading(false);
  }
}
  /* REVEAL STEP 2 — flip one question on tap.
   * Both branches build a NEW array, never .push(): React compares by reference,
   * so mutating in place looks unchanged and skips the re-render.
   * JS needs parens: `if (x) {}`, not Python's `if x:`. */
  function toggleHandler(index: number) {
    if (revealed.includes(index)) {
      setRevealed(revealed.filter(i => i !== index))  // showing -> hide (keep all but this)
    } else {
      setRevealed([...revealed, index])               // hidden -> show (copy + append)
    }
  }
  // store it into the endpoint of returns
  return (
    <View style={styles.container}>
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      >
        <TextInput
          value={nurseTopic}
          onChangeText={setNurseTopic}
          placeholder="Enter a nursing topic"
          style={styles.input}
        />

        <Button title='Get Quiz' onPress={getQuiz} />
        {loading ? <Text>Loading...</Text> : null}
        {error ? <Text>{error}</Text> : null}

        {/* REVEAL STEP 3 — data array -> JSX array, each item tappable.
          * map arrow uses PARENS to return JSX; braces would need an explicit return.
          * key: required, unique, lets React track items across re-renders.
          * onPress={() => fn(i)}: arrow defers the call. Without it, fn runs during
          * render and loops forever. */}
        {quiz.map((q, index) => (
          <Pressable key={ index } onPress={ () => toggleHandler(index) }>
            <Text>{q.question}</Text>
            { revealed.includes(index) ? <Text>{q.answer}</Text> : null }
          </Pressable>
        ))}

        {user.isLoggedIN ? (
          <Text>You are logged in!</Text>
        ) : (
          <Button title='Log-in' onPress={loggedIN} />
        )
      }
      </ScrollView>
        <StatusBar style="auto" />
    </View>
  );
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

