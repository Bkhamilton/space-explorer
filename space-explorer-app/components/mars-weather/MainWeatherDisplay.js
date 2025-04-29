import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

const MainWeatherDisplay = ({ selectedDay, width }) => (
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
);

const styles = StyleSheet.create({
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

export default MainWeatherDisplay;
