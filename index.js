import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import apiKey from './config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const city = req.query.city || 'New Delhi';
    const weatherData = await getWeatherData(city);
    res.render('index', { weatherData, city });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.render('index', { weatherData: null, city: 'Delhi' });
  }
});

const getWeatherData = async (city) => {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const weatherResponse = await axios.get(apiUrl);
    const weatherData = weatherResponse.data;

    const uvApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`;
    const uvResponse = await axios.get(uvApiUrl);
    const uvData = uvResponse.data;

    const timeApiUrl = `https://timeapi.io/api/Time/current/coordinate?latitude=${weatherData.coord.lat}&longitude=${weatherData.coord.lon}`
    const timeResponse = await axios.get(timeApiUrl);
    const timeData = timeResponse.data;
    
    const sunriseSetUrl = `https://api.sunrisesunset.io/json?lat=${weatherData.coord.lat}&lng=${weatherData.coord.lon}`;
    const sunriseSetResponse = await axios.get(sunriseSetUrl);
    const sunriseSetData = sunriseSetResponse.data;

    const sunrise = sunriseSetData.results.sunrise;
    const sunset = sunriseSetData.results.sunset;
    // console.log(sunriseSetData);
    return {
      ...weatherData,
      uvi: uvData.value,
      sunrise,
      sunset,
      c_time: timeData.time,
      c_day: timeData.dayOfWeek,
      c_date: timeData.date,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};


  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
