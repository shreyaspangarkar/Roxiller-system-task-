const express = require('express');
const path = require('path');
const apiRoutes = require('./api'); 
const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
