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
    database: 'dbreviewtas',
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
    // res.render('components/bagsData/bagPost')
    res.render('home', {
        status: 'default'
    })
})

app.get('/profile/self/follower', (req, res) => {
    res.render('components/accountMenu/follower');
})

app.get('/profile/self', (req, res) => {
    res.render('components/accountMenu/profile-self');
})

app.get('/profile/edit', (req, res) => {
    res.render('components/accountMenu/editProfile');
})

app.get('/searchresults', (req, res) => {
    res.render('searchresults');
})
app.get('/addReview', (req, res) => {
    res.render('components/accountMenu/addBagReview')
})
app.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard')
})

// Error message tidak diisi dulu (kosong)
app.get('/signup', (req, res) => {
    res.render('signup', { errorMsg: null })
})
app.get('/login', (req, res) => {
    res.render('login', { errorMsg: null });
})

// app.post('/login', (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     if (email === 'admin@bags.com' && password === 'admin') {
//         res.render('home', {
//             status: 'admin'
//         })
//     }
//     else {
//         res.render('home', {
//             status: 'user'
//         })
//     }
// })

app.post('/login', (req, res) => {
    const usernameOrEmail = req.body.usernameOrEmail;
    const password = req.body.password;
    const accountQuery = 'SELECT `Username`, `Password`, `E_mail`, `IsAdmin` FROM `account` WHERE (`Username` = ? OR `E_mail` = ?) AND `Password` = ?';
    pool.query(accountQuery, [usernameOrEmail, usernameOrEmail, password], (error, results) => {
        if (error) {
            // error handling dilog dulu ajah
            console.log(error);
        } else if (results.length > 0) {
            // login successful
            const user = results[0];
            if (user.IsAdmin === 1) {
                res.render('home', {
                    status: 'admin'
                });
            } else {
                res.render('home', {
                    status: 'user'
                });
            }
        } else {
            // fail login, display error di login /
            res.render('login', {
                errorMsg: 'Invalid login credentials'
            });
        }
    });
});