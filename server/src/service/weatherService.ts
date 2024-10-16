import dotenv from 'dotenv';
//import fs from 'node:fs/promises';
dotenv.config();

// DONE: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// DONE: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// DONE: Complete the WeatherService class
class WeatherService {
  // DONE: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  // DONE: Create fetchLocationData method
  async fetchLocationData(cityName: string) {
    //console.log('weatherServie.ts fetchLocationData executed');
    
    try{
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${cityName}&limit=1&appid=${this.apiKey}`);

      const locationData = await response.json();
      return locationData;
    } catch (err) {
      console.log('Error', err);
      return err;
    }

  }

  // DONE: Create destructureLocationData method
  destructureLocationData(locationData: Coordinates): Coordinates {
    //console.log('destructureLocationData executed');
    return {
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon,
      country: locationData.country,
      state: locationData.state
    }
  }

  // // DONE: Create buildGeocodeQuery method
  // private buildGeocodeQuery(cityName: string): string {
  //   if (!cityName || !this.baseURL || !this.apiKey) {
  //     throw new Error('Missing required parameters for geocode query.');
  //   }

  //   const gecodeQueryString = `${this.baseURL}/geo/1.0/direct?q=${cityName}&limit=1&appid=${this.apiKey}`;

  //   return gecodeQueryString;
  
  // }

  // DONE: Create buildWeatherQuery method
  buildWeatherQuery(coordinates: Coordinates[]): string {
    //console.log('buildWeatherQuery executed');
    const lat = coordinates[0].lat;
    const lon = coordinates[0].lon;
    if (!lat || !lon /*|| !this.baseURL || !this.apiKey*/) {
      throw new Error('Missing required parameters for weather query.');
    }

    const weatherQueryString = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;

    return weatherQueryString;

  }

  // DONE: Create fetchAndDestructureLocationData method
  async fetchAndDestructureLocationData(cityName: string): Promise<Coordinates | any> {
    try{  
      //console.log('fetchAndDestructureLocationData exectued');
      // Fetch location data using the city name
      const locationData = await this.fetchLocationData(cityName);

      // Wait for the location data to be returned
      const response = await locationData.json();

      // Destructure the location data
      const coordinates = this.destructureLocationData(response[0]);

      return coordinates;

    } catch (err) {
      console.error('Error fetching location data:', err);
      return err;
    }
  }
  
  // DONE: Create fetchWeatherData method
  async fetchWeatherData(coordinates: Coordinates[]): Promise<any> {
    try{
      const returnArray = [];
      // Build the weather query using coordinates
      const weatherQuery = this.buildWeatherQuery(coordinates);

      // Make the API request
      //console.log(weatherQuery);
      const response = await fetch(weatherQuery);

      // check the response
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }

      // Parse the respone from the weather website
      const weatherData = await response.json();
      const parsedWeatherData = this.parseCurrentWeather(weatherData);

      returnArray.push(parsedWeatherData);
      
      // Return the weather data
      return returnArray;

    } catch (err) {
      console.error('Error fetching weather data:', err);
      throw err;
    }

  }

  // DONE: Build parseCurrentWeather method
  parseCurrentWeather(response: any): any {
    //console.log('parseCurrentWeather executed');
    //console.log(response);
    let forecastObject: Record<string, any> = {};
    let fiveDayData: Weather[] = [];

    // Date formatting options
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    for (let i=0; i<=40; i+=8) {
      if (i==40){i--;}
      const city = response.city.name;
      const timestamp = response.list[i].dt; // Current timestamp 
      const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date); // Convert date to ISO string
      const icon = response.list[i].weather[0].icon; // Current weather icon from the 'weather' object
      const tempK = response.list[i].main.temp; // Current temperature from the 'main' object
      const tempF = Math.round((tempK - 273.15) * 9/5 + 32); // Convert temperature to Fahrenheit
      const windSpeed = response.list[i].wind.speed; // Current wind speed from the 'wind' object
      const humidity = response.list[i].main.humidity; // Current humidity from the 'main' object

      // Create a new Weather object
      const currentWeather = new Weather(city, formattedDate, icon, tempF, windSpeed, humidity);
      
      if (i==0) {
        forecastObject.currentForecast = currentWeather;
      } else {
        fiveDayData.push(currentWeather);
      }
    }

    forecastObject.fiveDayForecast = fiveDayData;

    //console.log('forecast object: ',forecastObject, 'in parseCurrentWeather of weatherService.ts line 173');
    return forecastObject;

  }
  // // TODO: Complete buildForecastArray method
  // buildForecastArray(currentWeather: Weather, weatherData: any[]) {
  //   console.log('buildForecastArray executed');
  //   // Initialize an empty array to hold weather objects
  //   const forecastArray: Weather[] = [];

  //   // Add the current weather as the first item in the forecast array
  //   forecastArray.push(currentWeather);

  //   // Loop through the weather data and add the next 5 days of weather to the forecast array
  //   for (const entry of weatherData) {
  //     const date = entry.dt_txt; // || new Date(entry.dt * 1000).toISOString();
  //     const temperature = entry.main.temp;
  //     const windSpeed = entry.wind.speed;
  //     const humidity = entry.main.humidity;

  //   // Create a new Weather object for each forecast entry
  //   const forecastWeather = new Weather(city, formattedDate, icon, tempF, windSpeed, humidity);

  //   // Add the Weather object to the forecast array
  //   forecastArray.push(forecastWeather);
  //   }

  //   return forecastArray;

  // }

//   // TODO: Complete getWeatherForCity method
//   async getWeatherForCity(cityName: string): Promise<Weather[]> {
//     try {
//       console.log('getWeatherForCity executed');
//       // Fetch and destructure the location data
//       const coordinates = await this.fetchAndDestructureLocationData(cityName);
//       // Fetch the weatehred data using the coordinates
//       const weatherData = await this.fetchWeatherData(coordinates);
//       // Parse the current weather from the weather data
//       const currentWeather = this.parseCurrentWeather(weatherData);
//       // Build the forecast array
//       const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
//       // Return the complete weather forecast array
//       return forecastArray;
//     } catch (err) {
//       console.error('Error getting weather for city:', err);
//       throw new Error('Error getting weather for city.');
//     }
//   }
}

export default new WeatherService();
