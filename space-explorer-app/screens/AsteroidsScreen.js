import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getAsteroids } from '../services/api';
import Card from '../components/Card';

const AsteroidsScreen = () => {
    const [asteroids, setAsteroids] = useState([]);

    useEffect(() => {
        const fetchAsteroids = async () => {
            console.log('Fetching asteroids...'); // Debugging log
            const response = await getAsteroids();
            console.log(JSON.stringify(response.data, null, 2)); // Log the full response for debugging
            setAsteroids(response.data.near_earth_objects);
        };
        fetchAsteroids();
    }, []);

    const renderItem = ({ item }) => (
        <Card>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Diameter: {item.estimated_diameter.meters.estimated_diameter_max} m</Text>
            <Text>Hazardous: {item.is_potentially_hazardous_asteroid ? '⚠️ Yes' : 'No'}</Text>
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={asteroids}
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
    name: { 
        fontWeight: 'bold', 
        fontSize: 16 
    },
});

export default AsteroidsScreen;