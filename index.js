const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyparser = require("body-parser");

const connectDB = require('./database/connection');
const {initializeGridFs} = require('./database/grid-fs');

const app = express();

dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 8080

// log requests
app.use(morgan('tiny'));

// cors
app.use(cors({
    origin: '*'
}));

// mongodb connection
connectDB();

// grid fd
initializeGridFs();

// parse request to body-parser
app.use(bodyparser.json({limit: '20mb'}));

// load routers
app.use('/', require('./router/router.js'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});

process.on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    }).on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });