import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import React, { useState } from 'react';
import { colors, spacing, fontSize, radius } from './src/theme';

  // Defining the shape of my data. user 'interface' to build it out - similar to BaseModel in Pydantic.
  interface User {
    name: string;
    isLoggedIN: boolean;
  };

  interface Question {
    question: string;
    answer: string;
  }

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
    setLoading(true);  // set loading to true while we wait for the fetch to complete. Telling the app that we are waiting for a response from the API.

    setError("")
    try {
    const response = await fetch("http://localhost:8000/claude-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: nurseTopic}),
    });
    // Throw a status error if you run into an issue with fetching from the API.
    if (!response.ok) {
      throw new Error(`HTTP could not fetch. Status: ${response.status}`);
    };  
    // parse the body, this is the second wait.
    const data = await response.json();

    setQuiz(data["claude's reply"]);  // set the quiz state to the questions returned from the API. Put in square brackets is mandatory to pull the key.
    // set a catch as (e) to respond to any errors.
    } catch (e) {
      setError('Could not load the quiz. Please try again.');

    } finally {
      setLoading(false);
    }
  };
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

