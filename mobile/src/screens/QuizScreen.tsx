import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, spacing, fontSize, radius } from '../theme';
import { fetchQuiz, fetchQuizList, fetchQuizById, Question, SavedQuiz } from '../lib/api';
import QuizListItem from '../components/QuizListItem';

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
  const [nurseQuestion, setNurseQuestion] = useState<string>("");
  const [nurseTopic, setNurseTopic] = useState<string>("");
  const [savedQuizzes, setSavedQuizzes] = useState<SavedMedCardsLists[]>([]);  // savedQuizzes is to read-only.
  const [openQuizzes, setOpenQuizzes] = useState<SavedQuiz | null>(null)  // State can hold the Object SavedQuiz or null. Holds one thing, or nothing yet.
  /* REVEAL STEP 1 — which answers are showing.
   Holds KEYS, not positions. Two lists render answers (the generated quiz and an
   opened saved quiz) and both count from 0, so plain indices collided: revealing
   question 1 up top also revealed question 1 down below.
   Saved questions use their real UUID. Generated ones have no id yet (the POST
   returns Claude's raw JSON), so they get a "gen-<index>" key. A UUID can never
   equal "gen-0", so the two lists can't step on each other. */
  const [revealed, setRevealed] = useState<string[]>([])
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
    loadSaved();  // The call has to happen after the function definition -- otherwise there will be an infinite recursion (freeze the app).
  }, []);

  async function openSavedQuiz(quizId: string) {  // Handler to allow the topic to be clickable and revisited.
    try {
      if (openQuizzes?.id === quizId) {  // ?. is optional chaining 
        setOpenQuizzes(null);  // closes the questions/answers by clicking the topic again.
        return
      }
      setOpenQuizzes(await fetchQuizById(quizId));
      setRevealed([]);
    } catch (e) {
      console.log('FAILED:', e);
      setError('This item is not selectable.')
    }
  }

  async function getQuiz() {
    setLoading(true);
    setError("");
    try {
      setQuiz(await fetchQuiz(nurseQuestion, nurseTopic));  // generate & save to Database.
      setRevealed([]);  // New quiz, fresh slate -- otherwise old reveals bleed onto the new questions.
      await loadSaved();  // Get's the quiz button -- Fetches the list.
    } catch (e) {
      setError('Could not load the quiz. Please reach out from more assistance.');
    } finally {
      setLoading(false);
    }
  }
  /* REVEAL STEP 2 — flip one question on tap.
   * Takes a KEY (see REVEAL STEP 1), not a position.
   * Both branches build a NEW array, never .push(): React compares by reference,
   * so mutating in place looks unchanged and skips the re-render.
   * JS needs parens: `if (x) {}`, not Python's `if x:`. */
  function toggleHandler(key: string) {
    if (revealed.includes(key)) {
      setRevealed(revealed.filter(k => k !== key))  // showing -> hide (keep all but this)
    } else {
      setRevealed([...revealed, key])               // hidden -> show (copy + append)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      >
        <TextInput
          value={nurseQuestion}
          onChangeText={setNurseQuestion}
          placeholder="Enter in question"
          style={styles.input}
        />

        <TextInput
        value={nurseTopic}
        onChangeText={setNurseTopic}
        placeholder='What is the topic?'
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
          <Pressable key={ `gen-${index}` } onPress={ () => toggleHandler(`gen-${index}`) }>
            <Text>{ q.question }</Text>
            { revealed.includes(`gen-${index}`) ? <Text>{q.answer}</Text> : null }
          </Pressable>
        ))}

        {savedQuizzes.map((q) => (  // Renders the given saved topics (e.g. Wounds, heart failure, etc.)
          <QuizListItem key={q.id} title={q.title} onTap={() => openSavedQuiz(q.id)} />  // Compon
        ))}

        {openQuizzes ? (
          <View>
            <Text>Notes on: {openQuizzes.title}</Text>
            {openQuizzes.questions.map((q) => (  // These come from GET /quizzes/{id}, so they have real UUIDs.
              <Pressable key={q.id} onPress={() => toggleHandler(q.id)}>
                <Text>{ q.question }</Text>
                {revealed.includes(q.id) ? <Text>{q.answer}</Text> : null}
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

