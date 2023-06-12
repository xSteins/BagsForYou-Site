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
    res.render('signup', { errorMsg: null, success: null })
})
app.get('/login', (req, res) => {
    res.render('login', { errorMsg: null, success: null });
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
                    status: 'admin', success: false
                });
            } else {
                res.render('home', {
                    status: 'user', success: false
                });
            }
        } else {
            // fail login, display error di login /
            res.render('login', {
                errorMsg: 'Invalid login credentials', success: false
            });
        }
    });
});

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const nama = req.body.nama;
    const email = req.body.email;
    const password = req.body.password;

    // validate input
    if (username.length > 31 || username.includes(' ')) {
        res.render('signup', {
            errorMsg: 'Invalid username : Terlalu panjang\n Maksimal 30 karakter', success: false
        });
    }
    else if (password.length > 41) {
        res.render('signup', {
            errorMsg: 'Invalid password : Terlalu panjang\n Maksimal 40 karakter', success: false
        });
    } else if (email.length > 41) {
        res.render('signup', {
            errorMsg: 'Invalid email : Terlalu panjang\n Maksimal 40 karakter', success: false
        });
    } else if (nama.length > 51) {
        res.render('signup', {
            errorMsg: 'Invalid nama : Terlalu panjang\n Maksimal 50 karakter', success: false
        });
    } else {
        // input is valid, insert into database
        const updateData = 'INSERT INTO `account` (`Username`, `Password`, `E_mail`, `Nama_Lengkap`, `IsAdmin`) VALUES (?, ?, ?, ?, ?)';
        pool.query(updateData, [username, password, email, nama, 0], (error, results) => {
            if (error) {
                // handle error
            } else {
                // signup successful
                res.render('/login', { errorMsg: 'Akun anda berhasil dibuat! Silahkan login.', success: true });
            }
        });
    }
});