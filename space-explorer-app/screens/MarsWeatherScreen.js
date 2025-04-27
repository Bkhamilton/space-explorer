import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getMarsWeather } from '../services/api';
import Card from '../components/Card';

const MarsWeatherScreen = () => {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await getMarsWeather();
        const solKeys = response.data.sol_keys; // Get the list of sol keys
        const weatherDetails = solKeys.map((sol) => ({
          sol,
          ...response.data[sol], // Spread the data for each sol
        }));
        setWeatherData(weatherDetails);
      } catch (error) {
        console.error('Error fetching Mars weather:', error);
      }
    };
    fetchWeather();
  }, []);

  const renderItem = ({ item }) => (
    <Card>
      <Text style={styles.solTitle}>Sol {item.sol}</Text>
      <Text>First UTC: {item.First_UTC}</Text>
      <Text>Last UTC: {item.Last_UTC}</Text>
      <Text>Average Temp: {item.AT?.av.toFixed(2)}°C</Text>
      <Text>Min Temp: {item.AT?.mn.toFixed(2)}°C</Text>
      <Text>Max Temp: {item.AT?.mx.toFixed(2)}°C</Text>
      <Text>Average Wind Speed: {item.HWS?.av.toFixed(2)} m/s</Text>
      <Text>Max Wind Speed: {item.HWS?.mx.toFixed(2)} m/s</Text>
      <Text>Average Pressure: {item.PRE?.av.toFixed(2)} Pa</Text>
      <Text>Most Common Wind Direction: {item.WD?.most_common?.compass_point}</Text>
    </Card>
  );

  if (!weatherData.length) return <Text>Loading Mars weather...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={weatherData}
        renderItem={renderItem}
        keyExtractor={(item) => item.sol}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  solTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default MarsWeatherScreen;