import express from 'express';
import path, { resolve } from 'path';
import session from 'cookie-session';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import fs from 'fs';



const app = express();
app.use(cookieParser());
const port = 8005;
const publicPath = path.resolve('static-path');

app.use(express.static(publicPath));
app.set('view engine', 'ejs');

import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }));

import mysql from 'mysql';
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

// Multer : untuk upload / export file :
// Multer configuration
import multer from 'multer';
// Set storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'tas-img'); // Specify the destination directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${Date.now()}${ext}`; // Generate a unique filename
        cb(null, fileName);
    }
});
// Create multer instance with the storage configuration
const upload = multer({ storage: storage });



app.listen(port, () => {
    console.log('App started');
    console.log(`Server running on http://localhost:${port}`);
});

function validateLoginStatus(req) {
    if (!req.cookies.username) {
        return 'anon';
    } else {
        const isAdmin = Number(req.cookies.is_admin);
        if (isAdmin === 1) {
            return 'admin';
        } else {
            return 'user';
        }
    }
}

function validateUsername(req) {
    console.log('Cookie - username:', req.cookies.username)
    console.log(req.cookies);
    return req.cookies.username;
}

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
        status: validateLoginStatus(req),
        username: validateUsername(req),
    });
});


app.get('/profile/self/follower', (req, res) => {
    res.render('components/accountMenu/follower', {
        username: validateUsername(req),
    });
});

app.get('/profile', (req, res) => {
    res.render('components/accountMenu/profile-self', {
        username: validateUsername(req),
    });
});
app.get('/profile/edit', (req, res) => {
    res.render('components/accountMenu/editProfile', {
        username: validateUsername(req),
    });
});

app.get('/searchresults', (req, res) => {
    console.log(req.query.search);
    const bagSearchQuery =
        'SELECT `Id_Tas`,`namaTas` FROM `tas` WHERE `namaTas` LIKE ?';
    const searchParam='%'+req.query.search+'%';
    pool.query(bagSearchQuery, searchParam, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            const resSearch=results;
            console.log(resSearch);
            res.render('searchresults',{
                search: req.query.search,
                bagsRes: resSearch
            });
        }
    });
});

app.get('/addReview', (req, res) => {
    res.render('components/accountMenu/addBagReview', {
        username: validateUsername(req),
    });
});

app.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard', {
        username: validateUsername(req),
    });
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
        'SELECT `Id_Account`, `Username`, `Password`, `E_mail`, `Nama_Lengkap`, `IsAdmin` FROM `account` WHERE (`Username` = ? OR `E_mail` = ?) AND `Password` = ?';
    const accountParams = [usernameOrEmail, usernameOrEmail, password];

    pool.query(accountQuery, accountParams, (error, results) => {
        if (error) {
            console.log(error);
        } else if (results.length > 0) {
            const user = results[0];
            res.cookie('id_account', user.Id_Account);
            res.cookie('username', user.Username);
            res.cookie('email', user.E_mail);
            res.cookie('nama_lengkap', user.Nama_Lengkap);
            res.cookie('is_admin', user.IsAdmin);

            if (user.IsAdmin === 1) {
                res.redirect('/adminDashboard');
            } else {
                res.redirect('/');
            }
        } else {
            res.render('login', {
                errorMsg: 'Invalid login credentials',
                success: false,
            });
        }
    });
});

// console.log(cookie);

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
                res.redirect('/login');
                res.render('/login', { errorMsg: 'Akun anda berhasil dibuat! Silahkan login.', success: true });
            }
        });
    }
});

// app.post('/updateProfileData', function (req, res) {
//     const idAccount = req.cookies.id_account;
//     const newUsername = req.body.username;
//     const newEmail = req.body.email;
//     const newName = req.body.name;
//     const oldPassword = req.body.oldPass;
//     const newPassword = req.body.newPass;

//     // First, check if the old password is correct
//     const passwordCheckQuery = 'SELECT Password FROM account WHERE Id_Account = ?';

//     pool.query(passwordCheckQuery, [idAccount], function (err, results) {
//         if (err) {
//             console.error(err);
//             // return res.status(500).send('An error occurred while checking the old password.');
//         }
//         // Ensure that a row was found for the provided account ID
//         if (results.length === 0) {
//             // return res.status(400).send('Account not found.');
//         }
//         // Extract the stored password from the query results
//         const storedPassword = results[0].Password;
//         // Compare the provided old password with the stored password
//         if (oldPassword !== storedPassword) {
//             return res.status(401).send('Invalid old password.');
//         }
//         else {
//             // If the old password is correct, update the profile data in the database
//             const sql = `UPDATE account SET Username=?, E_mail=?, Nama_Lengkap=?, Password=? WHERE Id_Account=?`;
//             const values = [newUsername, newEmail, newName, newPassword, idAccount];

//             // Execute the SQL query to update the profile data
//             pool.query(sql, values, function (err, result) {
//                 if (err) {
//                     // Handle the error appropriately
//                     console.error(err);
//                     res.status(500).send('An error occurred while updating the profile data.');
//                 } else {
//                     // Profile data updated successfully
//                     res.redirect('/profile'); // Redirect to the profile page or any other desired destination
//                 }
//             });
//         }
//     });
// });

// Function to validate if the selected subcategory belongs to the selected category

function isSubcategoryValid(categoryId, subcategoryId) {
    const subcategoryOptions = subcategories[categoryId];
    return subcategoryOptions.some(option => option.id === parseInt(subcategoryId));
}
app.post('/addBagEntry', (req, res) => {
    const bagName = req.body['bag-name'];
    const category = req.body.category;
    const subcategory = req.body.subcategory;
    const color = req.body.color;
    const bagDesigner = req.body['bag-designer'];
    const bagBrand = req.body['bag-brand'];
    const bagDescription = req.body['bag-description'];
    const width = req.body.width;
    const length = req.body.length;
    const height = req.body.height;

    const dimensions = `${width}" x ${length}" x ${height}"`;

    // Validate if the selected subcategory belongs to the selected category
    const selectSubcategoryQuery = 'SELECT `Id_Subkategori` FROM `sub_kategori` WHERE `Id_Kategori` = ? AND `Id_Subkategori` = ?';
    pool.query(selectSubcategoryQuery, [category, subcategory], (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error validating subcategory.');
            return;
        }

        if (results.length === 0) {
            console.log('Invalid subcategory for the selected category');
            res.status(500).send('Invalid subcategory for the selected category.');
            return;
        }

        // Subcategory is valid, proceed with the bag entry insertion
        const insertQuery = 'INSERT INTO `tas`(`namaTas`, `Deskripsi`, `Warna`, `Dimensi`, `Id_Merk`, `Id_Designer`, `Id_Subkategori`) VALUES (?, ?, ?, ?, ?, ?, ?)';
        console.log('this is here');
        doThing();
        async function doThing(){
            let brandId,desigId;
            const brandIdQuery= await new Promise((resolve,reject)=>{
                pool.query('SELECT `Id_Merk` FROM `merk` WHERE Nama_Merk=?',bagBrand,(error,results)=>{
                    if(error){
                        console.log(error);
                        res.status(500).send('Error finding brand.');
                        reject(error);
                    }
                    else{
                        // console.log(results.RowDataPacket);
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                });
            });
        
            // console.log('test2');
            brandId=brandIdQuery[0].Id_Merk;
            if(bagDesigner===''){
                desigId=null;
            }
            else{
                const desigIdQuery= await new Promise((resolve,reject)=>{
                    pool.query('SELECT `Id_Designer` FROM `designer` WHERE Nama_Designer=?',bagDesigner,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding designer.');
                            reject(error);
                        }
                        else{
                            // console.log(results.RowDataPacket);
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                desigId=desigIdQuery[0].Id_Designer;
            }
            const insertParams = [bagName, bagDescription, color, dimensions, brandId, desigId, subcategory];
            pool.query(insertQuery, insertParams, (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Error adding bag entry.');
                } else {
                    const bagId = results.insertId;
                    const selectQuery = 'SELECT * FROM `tas` WHERE `Id_Tas` = ?';
                    pool.query(selectQuery, [bagId], (error, bagData) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error retrieving bag data.');
                        } else {
                            console.log('Bag entry added successfully.');
                            console.log('Bag Data:', bagData);
                            res.status(200).send('Bag entry added successfully.');
                        }
                    });
                }
            });
        }
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('id_account');
    res.clearCookie('username');
    res.clearCookie('email');
    res.clearCookie('nama_lengkap');
    res.clearCookie('is_admin');
    res.redirect('/');
});
app.get('/bag/:number',(req,res)=>{
    const getBag ='SEARCH * FROM `tas` WHERE `Id_Tas` = ?';
    pool.query(getBag, req.params.number, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            
        }
    });
    res.render('components/bagsData/bagPost');
})