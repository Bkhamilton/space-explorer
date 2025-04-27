import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getLaunches } from '../services/api'; // Ensure this fetches the correct endpoint
import Card from '../components/Card';

const LaunchesScreen = () => {
    const [launches, setLaunches] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLaunches = async () => {
            try {
                const response = await getLaunches(); // Fetch the data
                if (response && response.data && response.data.results) {
                    setLaunches(response.data.results); // Set the formatted `results` array
                } else {
                    console.error('Invalid response format:', response);
                    setError('Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching launches:', error);
                setError('Failed to fetch launches');
            }
        };
        fetchLaunches();
    }, []);

    const renderItem = ({ item }) => (
        <Card>
            <Text style={styles.launchName}>{item.name}</Text>
            <Text>Launch Date: {new Date(item.net).toLocaleString()}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Mission: {item.mission}</Text>
            <Text>Rocket: {item.rocket}</Text>
            <Text>Launch Pad: {item.pad}</Text>
            <Text>Agency: {item.agency}</Text>
        </Card>
    );

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {launches.length > 0 ? (
                <FlatList
                    data={launches}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.name}-${index}`} // Use a unique key
                />
            ) : (
                <Text style={styles.loadingText}>Loading launches...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        flex: 1,
    },
    launchName: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#6c757d',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'red',
    },
});

export default LaunchesScreen;