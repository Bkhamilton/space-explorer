import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { getAPOD } from '../services/api';
import Loader from '../components/Loader';
import Error from '../components/Error';

const APODScreen = () => {
    const [apod, setApod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAPOD = async () => {
            try {
                const response = await getAPOD();
                setApod(response.data);
            } catch (err) {
                setError('Failed to fetch APOD.');
            } finally {
                setLoading(false);
            }
        };
        fetchAPOD();
    }, []);

    if (loading) return <Loader />;
    if (error) return <Error message={error} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: apod.url }} style={styles.image} />
            <Text style={styles.title}>{apod.title}</Text>
            <Text style={styles.explanation}>{apod.explanation}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 16, 
        alignItems: 'center' 
    },
    image: { 
        width: '100%', 
        height: 300, 
        borderRadius: 8, 
        marginBottom: 16 
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 8 
    },
    explanation: { 
        fontSize: 16 
    },
});

export default APODScreen;