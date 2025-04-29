import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { getMarsWeather } from '../services/api';
import * as Progress from 'react-native-progress';
import Header from '../components/mars-weather/Header';
import WeatherCard from '../components/mars-weather/WeatherCard';
import MainWeatherDisplay from '../components/mars-weather/MainWeatherDisplay';

const { width } = Dimensions.get('window');

const MarsWeatherScreen = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [selectedSol, setSelectedSol] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await getMarsWeather();
                const solKeys = response.data.sol_keys;
                const weatherDetails = solKeys.map((sol) => ({
                    sol,
                    ...response.data[sol],
                }));
                setWeatherData(weatherDetails);
                setSelectedSol(solKeys[0]); // Select first sol by default
            } catch (error) {
                console.error('Error fetching Mars weather:', error);
            }
        };
        fetchWeather();
    }, []);

    const selectedDay = weatherData.find(item => item.sol === selectedSol);

    if (!weatherData.length) {
        return (
            <View style={styles.loadingContainer}>
                <Progress.CircleSnail color={['#FF4500']} />
                <Text style={styles.loadingText}>Contacting Mars...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView
                style={styles.scrollContainer}
            >
                <ScrollView
                    horizontal
                    contentContainerStyle={styles.weatherList}
                    showsHorizontalScrollIndicator={false}
                >
                    {weatherData.map((item) => (
                        <WeatherCard
                            key={item.sol}
                            item={item}
                            selectedSol={selectedSol}
                            setSelectedSol={setSelectedSol}
                        />
                    ))}
                </ScrollView>
                {selectedDay && (
                    <MainWeatherDisplay selectedDay={selectedDay} width={width} />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    loadingText: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
    weatherList: {
        paddingBottom: 10,
    },
    scrollContainer: {
        padding: 16,
    },
});

export default MarsWeatherScreen;