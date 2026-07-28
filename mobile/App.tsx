import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState } from 'react';

  // Defining the shape of my data. user 'interface' to build it out - similar to BaseModel in Pydantic.
  interface User {
    name: string;
    isLoggedIN: boolean;
  };

export default function App() {

  const [user, setUser] = useState<User>({ name: "Michael", isLoggedIN: false});
  const [quiz, setQuiz] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // handler for logging in.
  function loggedIN() {
    setUser({ ...user, isLoggedIN: true });  // '...user' copies existing fields.
  }
  // handler for fetching the quizes from FastAPI.
  async function getQuiz() {
    setLoading(true);  // set loading to true while we wait for the fetch to complete. Telling the app that we are waiting for a response from the API.
    try {
    const response = await fetch("http://localhost:8000/claude-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: "heart failure"}),
    });
    // Throw a status error if you run into an issue with fetching from the API.
    if (!response.ok) {
      throw new Error(`HTTP could not fetch. Status: ${response.status}`);
    };

    // parse the body, this is the second wait.
    const data = await response.json();

    setQuiz(data["claude's reply"]);

    } finally {
      setLoading(false)
    }
  };
  // store it into the endpoint of returns
  return (
    <View style={styles.container}>
      <Button title='Get Quiz' onPress={getQuiz} />
      {quiz ? <Text>{quiz}</Text> : null}
      {loading ? <Text>Loading...</Text> : null}

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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

