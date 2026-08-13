import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, spacing, fontSize, radius } from '../theme';
import { fetchQuiz, fetchQuizList, fetchQuizById, Question, SavedQuiz } from '../lib/api';

  // Defining the shape of my data. user 'interface' to build it out - similar to BaseModel in Pydantic.
  interface User {
    name: string;
    isLoggedIN: boolean;
  };

export default function QuizScreen() {
  // Create states for given variables 
  const [user, setUser] = useState<User>({ name: "Michael", isLoggedIN: false });
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [nurseTopic, setNurseTopic] = useState<string>("");
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);  // savedQuizzes is to read-only.
  const [openQuizzes, setOpenQuizzes] = useState<SavedQuiz | null>(null)  // State can hold the Object SavedQuiz or null. Holds one thing, or nothing yet.
  /* REVEAL STEP 1 — which answers are showing.
   * Indices only: [] = none, [0,3] = questions 1 and 4.
   * Separate from `quiz` because that's server data; this is UI state. */
  const [revealed, setRevealed] = useState<number[]>([]);

  // handler for logging in.
  function loggedIN() {
    setUser({ ...user, isLoggedIN: true });  // '...user' copies existing fields.
  }
  // handler for fetching the quizes from FastAPI.
  async function loadSaved() {  // Defining the function before we call it with useEffect().
    try {
      setSavedQuizzes(await fetchQuizList()); // Write -- for data to come in.
    } catch (e) {
      setError('Quiz could not be loaded. Please try again later.')
    }
  }

  useEffect(() => {
    loadSaved();  // The call has to happen after the function definition -- otherwise there will be an infinite recursion (freez the app).
  }, []);

  async function openSavedQuiz(quizId: string) {  // Handler to allow the topic to be clickable and revisited.
    console.log('TAPPED:', quizId)
    try {
      if (openQuizzes?.id === quizId) {
        setOpenQuizzes(null);  // closes the questions/answers by clicking the topic again.
        setRevealed([]);
        return
      }
      setOpenQuizzes(await fetchQuizById(quizId));
    } catch (e) {
      console.log('FAILED:', e);
      setError('This item is not selectable.')
    }
  }

  async function getQuiz() {
    setLoading(true);
    setError("");
    try {
      setQuiz(await fetchQuiz(nurseTopic));  // generate & save to Database.
      await loadSaved();  // Get's the quiz button -- Fetches the list.
    } catch (e) {
      setError('Could not load the quiz. Please reach out from more assistance.');
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
            <Text>{ q.question }</Text>
            { revealed.includes(index) ? <Text>{q.answer}</Text> : null }
          </Pressable>
        ))}

        {savedQuizzes.map((q) => (  // Renders the give saved topics (e.g. Wounds, heart failure, etc.)
          <Pressable key={q.id} onPress={() => openSavedQuiz(q.id)}>
            <Text>{ q.title }</Text>
          </Pressable>
        ))}

        {openQuizzes ? (
          <View>
            <Text>Notes on: {openQuizzes.title}</Text>
            {openQuizzes.questions.map((q, index) => (
              <Pressable key={q.id} onPress={() => toggleHandler(index)}>
                <Text>{q.question}</Text>
                {revealed.includes(index) ? <Text>{q.answer}</Text> : null}
              </Pressable>
            ))}
          </View>
        ) : null}

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

