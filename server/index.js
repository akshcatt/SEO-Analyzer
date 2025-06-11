const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const analyze = require('./routes/analyze.js');
const insert = require('./routes/insert.js');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const PORT =  process.env.PORT ;

// Initialize the Express application
const app = express();


// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

//routes
app.use('/analyze', analyze);
app.use('/insert-keyword', insert);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running`);
});

