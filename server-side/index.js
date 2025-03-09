require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Default Route GET (/)
app.get('/', (req, res) => {
    res.send('Hello in nodejs-app-starter');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
