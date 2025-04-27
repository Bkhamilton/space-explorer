import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

const Error = ({ message, onRetry } : ErrorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚨 {message}</Text>
      {onRetry && (
        <Button title="Retry" onPress={onRetry} color="#6200ee" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default Error;