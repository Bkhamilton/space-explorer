import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMarsWeather } from '../services/api';
import Card from '../components/Card';

const MarsWeatherScreen = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const response = await getMarsWeather();
      setWeather(response.data);
    };
    fetchWeather();
  }, []);

  if (!weather) return null;

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Mars Weather</Text>
        <Text>Temperature: {weather.temp}°F</Text>
        <Text>Wind Speed: {weather.wind_speed} mph</Text>
        <Text>Season: {weather.season}</Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { 
        padding: 16 
    },
    title: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 8 
    },
});

export default MarsWeatherScreen;