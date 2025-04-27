import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAsteroids } from '../services/api';
import Card from '../components/Card';

const AsteroidsScreen = () => {
    const [asteroids, setAsteroids] = useState([]);

    useEffect(() => {
        const fetchAsteroids = async () => {
            try {
                const response = await getAsteroids();
                const nearEarthObjects = response.data.near_earth_objects;
                const flattenedAsteroids = Object.values(nearEarthObjects).flat();
                setAsteroids(flattenedAsteroids);
            } catch (error) {
                console.error('Error fetching asteroids:', error);
            }
        };
        fetchAsteroids();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={[
            styles.card,
            item.is_potentially_hazardous_asteroid && styles.hazardousCard
        ]}>
            <View style={styles.cardHeader}>
                <Icon 
                    name={item.is_potentially_hazardous_asteroid ? 'alert-octagon' : 'star'} 
                    size={24} 
                    color={item.is_potentially_hazardous_asteroid ? '#ff4757' : '#f1c40f'} 
                />
                <Text style={styles.name}>{item.name.replace(/[()]/g, '')}</Text>
            </View>
            
            <View style={styles.detailRow}>
                <Icon name="ruler" size={16} color="#7f8c8d" />
                <Text style={styles.detailText}>
                    Diameter: <Text style={styles.highlight}>{item.estimated_diameter.meters.estimated_diameter_max.toFixed(2)} m</Text>
                </Text>
            </View>

            <View style={styles.detailRow}>
                <Icon name="calendar" size={16} color="#7f8c8d" />
                <Text style={styles.detailText}>
                    Approach: <Text style={styles.highlight}>{item.close_approach_data[0]?.close_approach_date || 'N/A'}</Text>
                </Text>
            </View>

            <View style={styles.detailRow}>
                <Icon name="map-marker-distance" size={16} color="#7f8c8d" />
                <Text style={styles.detailText}>
                    Miss Distance: <Text style={styles.highlight}>
                        {item.close_approach_data[0]?.miss_distance.kilometers 
                            ? `${parseFloat(item.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km` 
                            : 'N/A'}
                    </Text>
                </Text>
            </View>

            <View style={styles.hazardContainer}>
                <Text style={[
                    styles.hazardText,
                    item.is_potentially_hazardous_asteroid ? styles.hazardYes : styles.hazardNo
                ]}>
                    {item.is_potentially_hazardous_asteroid ? '⚠️ POTENTIALLY HAZARDOUS' : 'Non-hazardous'}
                </Text>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Near-Earth Objects</Text>
            <FlatList
                data={asteroids}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1128',
        padding: 16,
        paddingTop: 40,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#1a237e',
        marginBottom: 15,
        borderRadius: 12,
        padding: 16,
    },
    hazardousCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#ff4757',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        color: '#bdc3c7',
        marginLeft: 8,
        fontSize: 14,
    },
    highlight: {
        color: '#fff',
        fontWeight: '600',
    },
    hazardContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2c3e50',
    },
    hazardText: {
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    hazardYes: {
        color: '#ff4757',
    },
    hazardNo: {
        color: '#2ecc71',
    },
});

export default AsteroidsScreen;