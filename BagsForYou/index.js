import express from 'express';
import mysql from 'mysql';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'cookie-session';
import crypto from 'crypto';

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
    "typeCast": function castField(field, useDefaultTypeCasting) {
        if ((field.type === "BIT") && (field.length === 1)) {
            var bytes = field.buffer();
            return (bytes[0]);
        }
        return (useDefaultTypeCasting());
    }
});

// Middleware connection
const key1 = crypto.randomBytes(32).toString('hex');
const key2 = crypto.randomBytes(32).toString('hex');
app.use(
    session({
        name: 'session',
        // Updated this key to be random value using crypto
        keys: [key1, key2],
        secret: 'must be filled later...',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true, // Use true if you have HTTPS
            httpOnly: true,
            maxAge: 8 * 60 * 60 * 1000,
            // maxAge: 24 * 60 * 60 * 1000, 
            // max 24h cookies, mungkin disingkat u/ debugging dulu gaes (8 jam sahaja)
        },
    })
);

app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
});

function validateAccountType(is_admin) {
    // Typecast is_admin to a number
    const isAdmin = Number(is_admin);
    // Check if is_admin is 1 or 0
    if (isAdmin === 1) {
        return 'admin';
    } else if (isAdmin === 0) {
        return 'user';
    } else {
        return 'default';
    }
}

function validateUsername(username) {
    // Check if username is defined
    if (username) {
        return username;
    } else {
        return null;
    }
}

// STORE ALL DATA DISINI ((TESTING DULU BESTIE))

app.get('/', (req, res) => {
    // Global value untuk akun yang sudah logged in
    const id_account = req.session.id_account;
    const username = req.session.username;
    const email = req.session.email;
    const nama_lengkap = req.session.nama_lengkap;
    const is_admin = req.session.is_admin;

    let statusValidation = validateAccountType(is_admin);
    let usernameValidation = validateUsername(username);

    res.render('home', {
        status: statusValidation,
        username: usernameValidation,
    });
});

app.get('/profile/self/follower', (req, res) => {
    res.render('components/accountMenu/follower');
});

app.get('/profile', (req, res) => {
    res.render('components/accountMenu/profile-self');
});

app.get('/profile/edit', (req, res) => {
    res.render('components/accountMenu/editProfile');
});

app.get('/searchresults', (req, res) => {
    res.render('searchresults');
});
app.get('/addReview', (req, res) => {
    res.render('components/accountMenu/addBagReview');
});
app.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard');
});

// Error message tidak diisi dulu (kosong)
app.get('/signup', (req, res) => {
    res.render('signup', { errorMsg: null, success: null });
});
app.get('/login', (req, res) => {
    res.render('login', { errorMsg: null, success: null });
});
app.post('/login', (req, res) => {
    const usernameOrEmail = req.body.usernameOrEmail;
    const password = req.body.password;
    const accountQuery =
        'SELECT `Username`, `Password`, `E_mail`, `IsAdmin` FROM `account` WHERE (`Username` = ? OR `E_mail` = ?) AND `Password` = ?';
    const accountParams = [usernameOrEmail, usernameOrEmail, password];

    pool.query(accountQuery, accountParams, (error, results) => {
        if (error) {
            console.log(error);
        } else if (results.length > 0) {
            const user = results[0];
            req.session.username = user.Username;
            req.session.is_admin = user.IsAdmin === 1;

            if (user.IsAdmin === 1) {
                res.render('home', {
                    status: 'admin',
                    username: req.session.username,
                    success: false,
                });
            } else {
                res.render('home', {
                    status: 'user',
                    username: req.session.username,
                    success: false,
                });
            }
        } else {
            res.render('login', {
                errorMsg: 'Invalid login credentials',
                success: false,
            });
        }
    });
});

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const nama = req.body.nama;
    const email = req.body.email;
    const password = req.body.password;

    if (username.length > 31 || username.includes(' ')) {
        res.render('signup', {
            errorMsg: 'Invalid username: Terlalu panjang\n Maksimal 30 karakter',
            success: false,
        });
    } else if (password.length > 41) {
        res.render('signup', {
            errorMsg: 'Invalid password: Terlalu panjang\n Maksimal 40 karakter',
            success: false,
        });
    } else if (email.length > 41) {
        res.render('signup', {
            errorMsg: 'Invalid email: Terlalu panjang\n Maksimal 40 karakter',
            success: false,
        });
    } else if (nama.length > 51) {
        res.render('signup', {
            errorMsg: 'Invalid nama: Terlalu panjang\n Maksimal 50 karakter',
            success: false,
        });
    } else {
        const updateData =
            'INSERT INTO `account` (`Username`, `Password`, `E_mail`, `Nama_Lengkap`, `IsAdmin`) VALUES (?, ?, ?, ?, ?)';
        const updateParams = [username, password, email, nama, 0];

        pool.query(updateData, updateParams, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                req.session.username = username;
                req.session.is_admin = false;
                res.render('/login', { errorMsg: 'Akun anda berhasil dibuat! Silahkan login.', success: true });
            }
        });
    }
});


app.get('/logout', (req, res) => {
    req.session = null; // Clear the session data
    res.redirect('/'); // Redirect to the login page or any other desired page
});


app.get('/bp',(req,res)=>{
    res.render('components/bagsData/bagPost');
})