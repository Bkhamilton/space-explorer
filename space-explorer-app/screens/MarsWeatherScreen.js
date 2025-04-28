import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import { getMarsWeather } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

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

    const renderWeatherCard = (item) => (
        <TouchableOpacity
            key={item.sol}
            onPress={() => setSelectedSol(item.sol)}
            style={[
                styles.weatherCard,
                selectedSol === item.sol && styles.selectedCard,
            ]}
        >
            <Text style={styles.solText}>Sol {item.sol}</Text>
            <Text style={styles.dateText}>
                {new Date(item.First_UTC).toLocaleDateString()}
            </Text>
            <View style={styles.tempContainer}>
                <MaterialCommunityIcons name="thermometer" size={20} color="#ff4757" />
                <Text style={styles.tempText}>
                    {item.AT?.av?.toFixed(1) ?? 'N/A'}°C
                </Text>
            </View>
        </TouchableOpacity>
    );

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
            {/* Header */}
            <View style={styles.header}>
                <Image 
                    source={require('@/assets/mars-icon.jpg')} 
                    style={styles.marsIcon}
                />
                <Text style={styles.headerTitle}>Mars Weather Station</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView>
                {/* Daily Forecast Scroll */}
                <ScrollView
                    horizontal
                    contentContainerStyle={styles.weatherList}
                    showsHorizontalScrollIndicator={false}
                >
                    {weatherData.map(renderWeatherCard)}
                </ScrollView>

                {/* Main Weather Display */}
                {selectedDay && (
                    <View style={styles.mainWeatherContainer}>
                        {/* Temperature Section */}
                        <View style={styles.weatherSection}>
                            <Text style={styles.sectionTitle}>Temperature</Text>
                            <View style={styles.tempRangeContainer}>
                                <Text style={styles.tempMin}>
                                    {selectedDay.AT?.mn?.toFixed(1) ?? 'N/A'}°C
                                </Text>
                                <Progress.Bar 
                                    progress={(selectedDay.AT?.av + 100) / 150 || 0} 
                                    width={width * 0.6}
                                    color="#FF4500"
                                    unfilledColor="#3d3d3d"
                                    borderWidth={0}
                                    height={10}
                                />
                                <Text style={styles.tempMax}>
                                    {selectedDay.AT?.mx?.toFixed(1) ?? 'N/A'}°C
                                </Text>
                            </View>
                        </View>

                        {/* Wind Section */}
                        <View style={styles.weatherSection}>
                            <Text style={styles.sectionTitle}>Wind Conditions</Text>
                            <View style={styles.windContainer}>
                                <View style={styles.compass}>
                                    <View style={styles.compassCircle}>
                                        <View style={[
                                            styles.compassNeedle,
                                            { transform: [{ rotate: `${selectedDay.WD?.most_common?.compass_degrees || 0}deg` }] }
                                        ]} />
                                    </View>
                                </View>
                                <View style={styles.windDetails}>
                                    <Text style={styles.windText}>
                                        Avg: {selectedDay.HWS?.av?.toFixed(1) ?? 'N/A'} m/s
                                    </Text>
                                    <Text style={styles.windText}>
                                        Max: {selectedDay.HWS?.mx?.toFixed(1) ?? 'N/A'} m/s
                                    </Text>
                                    <Text style={styles.windDirection}>
                                        {selectedDay.WD?.most_common?.compass_point ?? 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Pressure Section */}
                        <View style={styles.weatherSection}>
                            <Text style={styles.sectionTitle}>Atmospheric Pressure</Text>
                            <View style={styles.pressureContainer}>
                                <Progress.Circle
                                    progress={(selectedDay.PRE?.av - 700) / 100 || 0}
                                    size={120}
                                    thickness={8}
                                    color="#9b59b6"
                                    unfilledColor="#3d3d3d"
                                    showsText={true}
                                    formatText={() => `${selectedDay.PRE?.av?.toFixed(0) ?? 'N/A'} Pa`}
                                />
                                <Text style={styles.pressureRange}>
                                    {selectedDay.PRE?.mn?.toFixed(0) ?? 'N/A'} - {selectedDay.PRE?.mx?.toFixed(0) ?? 'N/A'} Pa
                                </Text>
                            </View>
                        </View>

                        {/* Seasonal Info */}
                        <View style={styles.seasonContainer}>
                            <Text style={styles.seasonText}>
                                {selectedDay.Northern_season ?? 'N/A'} in Northern Hemisphere
                            </Text>
                            <Text style={styles.seasonText}>
                                {selectedDay.Southern_season ?? 'N/A'} in Southern Hemisphere
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 16,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    marsIcon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    weatherList: {
        paddingBottom: 10,
    },
    weatherCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        marginRight: 10,
        width: 100,
        alignItems: 'center',
    },
    selectedCard: {
        backgroundColor: '#FF4500',
    },
    solText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dateText: {
        color: '#aaa',
        fontSize: 12,
        marginVertical: 5,
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tempText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 16,
    },
    mainWeatherContainer: {
        marginTop: 20,
    },
    weatherSection: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#FF4500',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    tempRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tempMin: {
        color: '#4da6ff',
        fontSize: 16,
    },
    tempMax: {
        color: '#ff4757',
        fontSize: 16,
    },
    windContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compass: {
        marginRight: 20,
    },
    compassCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    compassNeedle: {
        width: 2,
        height: 40,
        backgroundColor: '#FF4500',
        position: 'absolute',
    },
    windDetails: {
        flex: 1,
    },
    windText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 5,
    },
    windDirection: {
        color: '#FF4500',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    pressureContainer: {
        alignItems: 'center',
    },
    pressureRange: {
        color: '#aaa',
        marginTop: 10,
    },
    seasonContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
    },
    seasonText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 5,
    },
});

export default MarsWeatherScreen;