import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Header = () => (
    <View style={styles.header}>
        <Image 
            source={require('@/assets/mars-icon.jpg')} 
            style={styles.marsIcon}
        />
        <Text style={styles.headerTitle}>Mars Weather Station</Text>
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 40,
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
});

export default Header;
