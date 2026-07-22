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
  
  function loggedIN() {
    setUser({ ...user, isLoggedIN: true });  // '...user' carries over the mutable data that was set.
  }

  return (
    <View style={styles.container}>
      <Text>Welcome: {user.name}</Text>

      {user.isLoggedIN ? (
        <Text>You are logged in!</Text>
      ) : (
        <Button title='Log in' onPress={loggedIN} />
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
