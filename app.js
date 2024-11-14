const express = require('express');
const path = require('path');
const apiRoutes = require('./api');  // Import the routes from api.js
const app = express();
const port = 5000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Link the API routes
app.use('/api', apiRoutes);  // All API requests will go to api.js

// Route to serve the dashboard.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
