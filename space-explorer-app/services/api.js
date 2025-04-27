import axios from 'axios';
import { BASE_URL } from '../constants/config';

export const getAPOD = () => axios.get(`${BASE_URL}/apod/`);
export const getLaunches = () => axios.get(`${BASE_URL}/launches/`);
export const getMarsWeather = () => axios.get(`${BASE_URL}/mars_weather/`);
export const getAsteroids = () => axios.get(`${BASE_URL}/asteroids/`);