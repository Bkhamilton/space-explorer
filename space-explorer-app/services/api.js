import axios from 'axios';
import { BASE_URL } from '../constants/config';

export const getAPOD = () => axios.get(`${BASE_URL}/apod/`);
export const getLaunches = () => axios.get(`${BASE_URL}/launches/`);
export const getMarsWeather = () => axios.get(`${BASE_URL}/mars-weather/`);
export const getAsteroids = () => axios.get(`${BASE_URL}/asteroids/`);

export const favoriteAPOD = (apodData) => {
    return axios.post(`${BASE_URL}/favorite-apod/`, apodData, {
        headers: {
            'Content-Type': 'application/json',
            // Add your auth header if using authentication
            // 'Authorization': `Bearer ${yourAuthToken}`,
        }
    });
};

export const getFavorites = () => {
    return axios.get(`${BASE_URL}/favorites/`, {
        headers: {
            // Add your auth header if using authentication
            // 'Authorization': `Bearer ${yourAuthToken}`,
        }
    });
};

export const unfavoriteAPOD = (apodId) => {
    return axios.delete(`${BASE_URL}/unfavorite-apod/${apodId}/`, {
        headers: {
            // Add your auth header if using authentication
            // 'Authorization': `Bearer ${yourAuthToken}`,
        }
    });
};

export const login = (username, password) => {
    return axios.post(`${BASE_URL}/login/`, { username, password }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const logout = () => {
    return axios.post(`${BASE_URL}/logout/`, {}, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};