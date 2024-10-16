import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
// using get for now
router.post('/', async (req: Request, res: Response) => {
  try {
    const cityName = req.body.cityName;
    // DONE: GET weather data from city name
    const coordinates = await WeatherService.fetchLocationData(cityName);
    const weatherData = await WeatherService.fetchWeatherData(coordinates);
    // DONE: save city to search history
    await HistoryService.addCity(cityName);
    res.json(weatherData);
  } catch (err) {
    console.log('Error: ',err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DONE: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const savedCities = await HistoryService.getCities();
    res.json(savedCities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
// router.delete('/history/:id', async (req, res) => {});

export default router;
