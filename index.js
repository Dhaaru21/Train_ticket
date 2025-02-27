const express = require('express'); const mongoose = require('mongoose'); const path = require('path');
const app = express(); const PORT = 8001;
 
app.use(express.json());
app.use(express.static(path.join(	dirname, 'public'))); // Serve static files
// MongoDB connection (replace with your actual MongoDB URI)
const MONGODB_URI = 'mongodb://localhost:27017/admin'; // Change to your correct DB URI
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Train Schema
const trainSchema = new mongoose.Schema({ trainName: { type: String, required: true },
trainNumber: { type: String, required: true, unique: true }, origin: { type: String, required: true },
destination: { type: String, required: true }, seatsAvailable: { type: Number, required: true }
});
const Train = mongoose.model('Train', trainSchema);
// Booking Schema
const bookingSchema = new mongoose.Schema({ trainNumber: { type: String, required: true }, passengerName: { type: String, required: true }, seatsBooked: { type: Number, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);
// Serve the static HTML file for the homepage app.get('/', (req, res) => {
res.sendFile(path.join(	dirname, 'views', 'index.html'));
});

// View All Trains (GET /trains) app.get('/trains', async (req, res) => {
try {
const trains = await Train.find(); if (trains.length === 0) {
return res.send('<h1>No Trains Available</h1>');
}
 
res.send(`
<h1>Available Trains</h1>
<ul>
${trains.map(train => `<li>${train.trainName} (${train.trainNumber}): ${train.origin} to ${train.destination} - Seats Available:
${train.seatsAvailable}</li>`).join('')}
</ul>
`);
} catch (error) {
res.status(500).send("Error fetching trains");
}
});
// Book a Ticket (POST /bookTicket) app.post('/bookTicket', async (req, res) => {
try {
const { trainNumber, passengerName, seatsBooked } = req.body; console.log('Received data:', req.body); // This will print the submitted data
in the server console
const train = await Train.findOne({ trainNumber });
if (!train) {
return res.status(404).json({ success: false, message: "Train not found"
});
}
if (train.seatsAvailable < seatsBooked) {
return res.status(400).json({ success: false, message: "Not enough seats available" });
}
// Update available seats train.seatsAvailable -= seatsBooked; await train.save();

// Create a booking
const booking = new Booking({ trainNumber, passengerName, seatsBooked });
await booking.save();
// Send response back
res.json({ success: true, passengerName, trainNumber, seatsBooked });
 
} catch (error) {
console.error('Error booking ticket:', error);
res.status(400).json({ success: false, message: "Error booking ticket" });
}
});
// Start server app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}`);
});
