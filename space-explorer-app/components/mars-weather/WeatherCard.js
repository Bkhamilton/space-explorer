import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WeatherCard = ({ item, selectedSol, setSelectedSol }) => (
    <TouchableOpacity
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

const styles = StyleSheet.create({
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
});

export default WeatherCard;
