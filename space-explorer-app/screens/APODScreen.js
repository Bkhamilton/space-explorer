import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { getAPOD, favoriteAPOD, getFavorites, unfavoriteAPOD } from '../services/api';
import Loader from '../components/Loader';
import Error from '../components/Error';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subDays } from 'date-fns';

const APODScreen = () => {
    const [apod, setApod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [favoriteId, setFavoriteId] = useState(null);

    const fetchAPOD = async (date = null) => {
        setLoading(true);
        try {
            const params = date ? { date: format(date, 'yyyy-MM-dd') } : {};
            const response = await getAPOD(params);
            setApod(response.data);
            checkIfFavorite(response.data.date || format(new Date(), 'yyyy-MM-dd'));
        } catch (err) {
            setError('Failed to fetch APOD.');
            console.error("Fetch APOD error:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async (date) => {
        try {
            const response = await getFavorites();
            const fav = response.data.favorites.find(f => f.apod.date === date);
            setIsFavorite(!!fav);
            if (fav) setFavoriteId(fav.id);
        } catch (err) {
            console.error("Error checking favorites:", err);
        }
    };

    const handleFavorite = async () => {
        if (!apod) return;
        
        try {
            if (isFavorite) {
                await unfavoriteAPOD(favoriteId);
                setIsFavorite(false);
                setFavoriteId(null);
                Alert.alert('Success', 'Removed from favorites');
            } else {
                const response = await favoriteAPOD({
                    title: apod.title,
                    explanation: apod.explanation,
                    url: apod.url,
                    hdurl: apod.hdurl || '',
                    date: apod.date || format(new Date(), 'yyyy-MM-dd'),
                    media_type: apod.media_type || 'image',
                    copyright: apod.copyright || ''
                });
                setIsFavorite(true);
                setFavoriteId(response.data.favorite_id);
                Alert.alert('Success', 'Added to favorites');
            }
        } catch (err) {
            console.error("Favorite error:", err);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await getFavorites();
            setFavorites(response.data.favorites);
            setFavoritesModalVisible(true);
        } catch (err) {
            console.error("Error loading favorites:", err);
            Alert.alert('Error', 'Failed to load favorites');
        }
    };

    const handleDateChange = (event, selected) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selected) {
            setSelectedDate(selected);
            fetchAPOD(selected);
        }
    };

    useEffect(() => {
        fetchAPOD();
    }, []);

    if (loading && !apod) return <Loader />;
    if (error) return <Error message={error} />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with date picker and favorites button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Icon name="calendar-today" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Astronomy Picture of the Day</Text>
                <TouchableOpacity onPress={loadFavorites}>
                    <Icon name="collections-bookmark" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Main content */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Media display */}
                {apod?.media_type === 'image' ? (
                    <Image 
                        source={{ uri: apod.hdurl || apod.url }} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.videoPlaceholder}>
                        <Icon name="ondemand-video" size={50} color="#666" />
                        <Text style={styles.videoText}>Video content available</Text>
                    </View>
                )}

                {/* Title and favorite button */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{apod?.title}</Text>
                    <TouchableOpacity onPress={handleFavorite}>
                        <Icon 
                            name={isFavorite ? "favorite" : "favorite-border"} 
                            size={28} 
                            color={isFavorite ? "#ff4757" : "#fff"} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Copyright and date */}
                {apod?.copyright && (
                    <Text style={styles.copyright}>© {apod.copyright}</Text>
                )}
                <Text style={styles.date}>
                    {apod?.date || format(new Date(), 'yyyy-MM-dd')}
                </Text>

                {/* Explanation */}
                <Text style={styles.explanation}>{apod?.explanation}</Text>

                {/* Date navigation */}
                <View style={styles.dateNavigation}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => {
                            const prevDate = subDays(selectedDate, 1);
                            setSelectedDate(prevDate);
                            fetchAPOD(prevDate);
                        }}
                    >
                        <Icon name="chevron-left" size={24} color="#fff" />
                        <Text style={styles.navButtonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => {
                            const nextDate = subDays(selectedDate, -1);
                            if (nextDate <= new Date()) {
                                setSelectedDate(nextDate);
                                fetchAPOD(nextDate);
                            }
                        }}
                    >
                        <Text style={styles.navButtonText}>Next</Text>
                        <Icon name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                />
            )}

            {/* Favorites modal */}
            <Modal
                visible={favoritesModalVisible}
                animationType="slide"
                onRequestClose={() => setFavoritesModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Favorite APODs</Text>
                        <TouchableOpacity onPress={() => setFavoritesModalVisible(false)}>
                            <Icon name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView>
                        {favorites.length > 0 ? (
                            favorites.map(fav => (
                                <TouchableOpacity 
                                    key={fav.id}
                                    style={styles.favoriteItem}
                                    onPress={() => {
                                        setSelectedDate(new Date(fav.apod.date));
                                        fetchAPOD(new Date(fav.apod.date));
                                        setFavoritesModalVisible(false);
                                    }}
                                >
                                    {fav.apod.media_type === 'image' ? (
                                        <Image 
                                            source={{ uri: fav.apod.url }} 
                                            style={styles.favoriteImage}
                                        />
                                    ) : (
                                        <View style={styles.favoriteVideoPlaceholder}>
                                            <Icon name="ondemand-video" size={30} color="#666" />
                                        </View>
                                    )}
                                    <View style={styles.favoriteText}>
                                        <Text style={styles.favoriteTitle}>{fav.apod.title}</Text>
                                        <Text style={styles.favoriteDate}>{fav.apod.date}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noFavoritesContainer}>
                                <Icon name="star-outline" size={50} color="#666" />
                                <Text style={styles.noFavorites}>No favorites yet</Text>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#30304d',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#1a1a2e',
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
        marginBottom: 16,
    },
    videoText: {
        color: '#666',
        marginTop: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        marginRight: 8,
    },
    copyright: {
        fontSize: 14,
        color: '#aaa',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    date: {
        fontSize: 16,
        color: '#ddd',
        marginBottom: 16,
    },
    explanation: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
        marginBottom: 24,
    },
    dateNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
    },
    navButtonText: {
        color: '#fff',
        marginHorizontal: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#30304d',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    favoriteItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#30304d',
    },
    favoriteImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 16,
    },
    favoriteText: {
        flex: 1,
        justifyContent: 'center',
    },
    favoriteTitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 4,
    },
    favoriteDate: {
        color: '#aaa',
        fontSize: 14,
    },
    favoriteVideoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 16,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFavoritesContainer: {
        alignItems: 'center',
        padding: 32,
    },
    noFavorites: {
        color: '#aaa',
        fontSize: 16,
        marginTop: 16,
    },
});

export default APODScreen;