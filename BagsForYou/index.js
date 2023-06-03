import express from 'express';
import mysql from 'mysql';
import path from 'path';
import bodyParser from 'body-parser';

import crypto from 'crypto'
import session from 'express-session';

const app = express();
const port = 8005;
const publicPath = path.resolve('static-path');

app.use(express.static(publicPath));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'MIBD-BagsForYou',
    // Undecided, harus dibuat lagi nanti
});
// Middleware connection 
app.use(
    session({
        secret: 'must be filled later...',
        resave: false,
        saveUninitialized: true
    })
);

app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
})

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/login', (req, res) => {
    res.render('login')
})
