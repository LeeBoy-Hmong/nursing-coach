import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import React, { useState } from 'react';
import { colors, spacing, fontSize, radius } from './src/theme';
import { fetchQuiz, Question } from './api';

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
  // store it into the endpoint of returns
  return (
    <View style={styles.container}>
      <TextInput
        value={nurseTopic}
        onChangeText={setNurseTopic}
        placeholder="Enter a nursing topic"
        style={styles.input}
      />

      <Button title='Get Quiz' onPress={getQuiz} />
      {loading ? <Text>Loading...</Text> : null}
      {error ? <Text>{error}</Text> : null}

      {quiz.map((q, index) => (
        <Text key={index}>{q.question}</Text>
      ))}

      {user.isLoggedIN ? (
        <Text>You are logged in!</Text>
      ) : (
        <Button title='Log-in' onPress={loggedIN} />
      )
    }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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

