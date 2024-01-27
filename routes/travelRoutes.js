const express = require('express');
const router = express.Router();
const fs = require('fs');

// Load Tours from JSON file
let toursData = JSON.parse(fs.readFileSync('./data/tours.json', 'utf-8'));
let historyData = [];

// Routes
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../views/index.html');
});

router.route('/travelagency')
  .get((req, res) => {
    res.sendFile(__dirname + '/../views/travelAgency.html');
  })
  .post((req, res) => {
    const newTour = { ...req.body, id: generateUniqueId(), availability: 'Available' };
    newTour.timestamp = new Date().toISOString();
    toursData.push(newTour);
    saveToursData();
    res.send({ result: newTour, message: 'Tour added successfully' });
  })
  .put((req, res) => {
    const updatedTour = req.body;
    const index = findTourIndexById(updatedTour.id);
    if (index !== -1) {
      updatedTour.timestamp = new Date().toISOString();
      toursData[index] = updatedTour;
      saveToursData();
      res.send({ result: updatedTour, message: 'Tour updated successfully' });
    } else {
      res.status(404).send({ message: 'Tour not found' });
    }
  })
  .delete((req, res) => {
    const tourIdToDelete = req.body.id;
    const index = findTourIndexById(tourIdToDelete);
    if (index !== -1) {
      const deletedTour = toursData.splice(index, 1)[0];
      deletedTour.timestamp = new Date().toISOString();
      historyData.push({ action: 'delete', timestamp: new Date().toISOString(), tour: deletedTour });
      saveToursData();
      saveHistoryData();
      res.send({ result: deletedTour, message: 'Tour deleted successfully' });
    } else {
      res.status(404).send({ message: 'Tour not found' });
    }
  });

router.get('/history', (req, res) => {
  res.send(historyData);
});

router.get('/viewtour/:id', (req, res) => {
  const tourId = req.params.id;
  const selectedTour = toursData.find(tour => tour.id.toString() === tourId);
  if (selectedTour) {
    res.send(selectedTour);
  } else {
    res.status(404).send({ message: 'Tour not found' });
  }
});

// Helper functions
function generateUniqueId() {
  return toursData.length + 1; // Temporary solution, you might want to use a more robust approach
}

function findTourIndexById(tourId) {
  return toursData.findIndex(tour => tour.id.toString() === tourId);
}

function saveToursData() {
  fs.writeFileSync('./data/tours.json', JSON.stringify(toursData, null, 2), 'utf-8');
}

function saveHistoryData() {
  fs.writeFileSync('./data/history.json', JSON.stringify(historyData, null, 2), 'utf-8');
}

module.exports = router;
