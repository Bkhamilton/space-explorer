import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getLaunches } from '../services/api';
import Card from '../components/Card';

const LaunchesScreen = () => {
    const [launches, setLaunches] = useState([]);

    useEffect(() => {
        const fetchLaunches = async () => {
            const response = await getLaunches();
            setLaunches(response.data.results);
        };
        fetchLaunches();
    }, []);

    const renderItem = ({ item }) => (
        <Card>
            <Text style={styles.launchName}>{item.name}</Text>
            <Text>Launch Date: {item.net}</Text>
            <Text>Status: {item.status.name}</Text>
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={launches}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 16 
    },
    launchName: { 
        fontWeight: 'bold', 
        fontSize: 16 
    },
});

export default LaunchesScreen;