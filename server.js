const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

const app = express();
const port = 3000;

let tourHistory = [];
let toursData = [];

// Load existing tours data from JSON file
try {
    const toursJson = fs.readFileSync(path.join(__dirname, 'data', 'tours.json'), 'utf-8');
    toursData = JSON.parse(toursJson);
} catch (error) {
    console.error('Error loading tours data:', error);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.route('/travelagency')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
    })
    .post(async (req, res) => {
        try {
            const { country, city, hotel, adults, children } = req.body;

            const availability = 'Available';

            const weatherConditions = await getWeatherConditions(city);

            const tourCost = calculateTourCost(adults, children);

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            const tour = {
                id: moment().valueOf(),
                country,
                city,
                hotel,
                adults,
                children,
                availability,
                weatherConditions,
                tourCost,
                timestamp,
            };
            toursData.push(tour);

            saveToursData();

            res.json({
                tourResult: tour,
                history: tourHistory,
                message: 'Tour added successfully!',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    .put((req, res) => {
        try {
            const { id, country, city, hotel, adults, children } = req.body;

            const tourIndex = toursData.findIndex(tour => tour.id === id);
            if (tourIndex !== -1) {
                const updatedTour = {
                    ...toursData[tourIndex],
                    country,
                    city,
                    hotel,
                    adults,
                    children,
                };

                toursData[tourIndex] = updatedTour;

                saveToursData();

                res.json({
                    tourResult: updatedTour,
                    message: 'Tour updated successfully!',
                });
            } else {
                res.status(404).json({ error: 'Tour not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    .delete((req, res) => {
        try {
            const { id } = req.body;

            const deletedTour = toursData.find(tour => tour.id === id);
            if (deletedTour) {
                toursData = toursData.filter(tour => tour.id !== id);

                const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
                const deletedRecord = {
                    tour: deletedTour,
                    timestamp,
                };
                tourHistory.push(deletedRecord);

                saveToursData();
                saveTourHistory();

                res.json({
                    message: 'Tour deleted successfully!',
                });
            } else {
                res.status(404).json({ error: 'Tour not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

app.get('/history', (req, res) => {
    res.json(tourHistory);
});

app.get('/tours', (req, res) => {
    res.json(toursData);
});

app.get('/weather', async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City parameter is missing' });
    }

    try {
        const weatherConditions = await getWeatherConditions(city);
        res.json({ weatherConditions });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function saveToursData() {
    const toursJson = JSON.stringify(toursData, null, 2);
    fs.writeFileSync(path.join(__dirname, 'data', 'tours.json'), toursJson, 'utf-8');
}

function saveTourHistory() {
    const historyJson = JSON.stringify(tourHistory, null, 2);
    fs.writeFileSync(path.join(__dirname, 'data', 'tourHistory.json'), historyJson, 'utf-8');
}

async function getWeatherConditions(city) {
    const apiKey = 'f0b917381c4240aaa45111118241701';
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data.current.condition.text;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return 'Weather data unavailable';
    }
}

function calculateTourCost(adults, children) {
    const adultCost = 100;
    const childCost = 50;
    return adults * adultCost + children * childCost;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
