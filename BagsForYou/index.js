import express from 'express';
import path, { resolve } from 'path';
import session from 'cookie-session';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import csv from 'csv-parser';


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
        cb(null, 'tes'); // Specify the destination directory
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
    const isAdmin = Number(req.cookies.is_admin);
    if (!req.cookies.username) {
        return 'anon';
    }
    else {
        if (isAdmin === 1) {
            return 'admin';
        }
        else {
            return 'user';
        }
    }
}
function returnUsername(req) {
    // console.log(req.cookies)
    return req.cookies.username;
}

function fetchBrandBagList() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT merk.Nama_Merk AS Merk, COUNT(tas.Id_Tas) AS 'Jumlah Tas'
        FROM merk
        LEFT JOIN tas ON tas.Id_Merk = merk.Id_Merk
        GROUP BY merk.Id_Merk, merk.Nama_Merk
        HAVING COUNT(tas.Id_Tas) > 0
    `;

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }

            const brands = results.map((row) => row.Merk);
            const bagCounts = results.map((row) => row['Jumlah Tas']);
            resolve({ brands, bagCounts });
        });
    })
}

function fetchTotalBags() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS TotalBags FROM tas';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalBags);
        });
    })
}

function fetchTotalCategories() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(Id_Kategori) AS TotalCategories FROM kategori';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalCategories);
        });
    })
}

function fetchTotalDesigners() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS TotalDesigners FROM designer';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalDesigners);
        });
    })
}

function fetchTotalReviews() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS TotalReviews FROM review';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalReviews);
        });
    })
}

function fetchAverageReviewValue() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT AVG(Bintang) AS AverageReviewValue FROM review';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].AverageReviewValue);
        });
    })
}

function fetchLowestRating() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT MIN(Bintang) AS LowestRating FROM review';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].LowestRating);
        });
    })
}

function fetchTotalSubcategories() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS TotalSubcategories FROM sub_kategori';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalSubcategories);
        });
    })
}

function fetchTotalAccounts() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(Id_Account) AS TotalAccounts FROM account';

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(results[0].TotalAccounts);
        });
    })
}

function fetchFollowerCount() {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT a.Username, COUNT(f.Id_Follower) AS FollowerCount FROM follow AS f INNER JOIN account AS a ON f.Id_Account = a.Id_Account GROUP BY f.Id_Account, a.Username',
            (error, results) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                const usernames = results.map((row) => row.Username);
                const followerCounts = results.map((row) => row.FollowerCount);
                resolve({ usernames, followerCounts });
            }
        );
    })
}

app.get('/', async (req, res) => {
    try {
        const data = {};
        const totalBags = await fetchTotalBags();
        data.totalBags = totalBags;
        const totalCategories = await fetchTotalCategories();
        data.totalCategories = totalCategories;
        const totalSubcategories = await fetchTotalSubcategories();
        data.totalSubcategories = totalSubcategories;
        const totalDesigners = await fetchTotalDesigners();
        data.totalDesigners = totalDesigners;
        const totalReviews = await fetchTotalReviews();
        data.totalReviews = totalReviews;

        res.render('home', {
            data: data, // Pass the data object
            status: validateLoginStatus(req),
            username: returnUsername(req),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/profile/self/follower', (req, res) => {
    const followerQuery = "SELECT a.`Username` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Follower` = a.`Id_Account` WHERE f.`Id_Account` = ?";
    const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Account` = ?";

    const accountLoggedIn = req.cookies.id_account;

    pool.query(followerQuery, [accountLoggedIn], (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const followers = results.map((row) => row.Username);

            pool.query(followingQuery, [accountLoggedIn], (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    console.log(results[0]);
                    const followingCount = results[0].followingCount;
                    res.render('components/accountMenu/follower', {
                        followers,
                        followingCount,
                        followerCount,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                    });
                }
            });
        }
    });
});



app.get('/profile/self/following', (req, res) => {
    const followingQuery = "SELECT a.`Username` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Account` = a.`Id_Account` WHERE f.`Id_Follower` = ?";
    const accountLoggedIn = req.cookies.id_account;

    pool.query(followingQuery, [accountLoggedIn], (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const following = results.map((row) => row.Username);

            const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Follower` = ?";
            pool.query(followerQuery, [accountLoggedIn], (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    const followerCount = results[0].followerCount;

                    res.render('components/accountMenu/following', {
                        following,
                        followerCount,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                    });
                }
            });
        }
    });
});



app.get('/profile', (req, res) => {
    const id_account = req.cookies.id_account;
    const getReviewObj = 'SELECT DISTINCT(`Id_Review`), `Isi_Review`, `Bintang`, `Id_Account`, `tas`.`namaTas`, `tas`.`Foto` FROM `review` INNER JOIN `tas` WHERE Id_Account = ?';

    pool.query(getReviewObj, id_account, (error, results) => {
        if (error) {
            console.log(error);
        } else if (results.length > 0) {
            const reviews = results;
            res.render('components/accountMenu/profile-self', {
                postResult: reviews,
                reviews: reviews,
                status: validateLoginStatus(req),
                username: returnUsername(req),
            });
        } else {
            res.render('components/accountMenu/profile-self', {
                postResult: null,
                status: validateLoginStatus(req),
                username: returnUsername(req),
            });
        }
    });
});



app.get('/profile/edit', (req, res) => {
    res.render('components/accountMenu/editProfile', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
        errorMessage: null
    });
});

app.post('/updateProfileData', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const name = req.body.name;
    const oldPassword = req.body.oldPass;
    const newPassword = req.body.newPass;
    const newPasswordValidation = req.body.newPassValidation;

    // Perform validation checks
    const usernameQuery = "SELECT Username FROM account WHERE Username = ?";
    const emailQuery = "SELECT E_mail FROM account WHERE E_mail = ?";
    const passwordQuery = "SELECT Password FROM account WHERE Password = ?";

    // Check if the username already exists
    pool.query(usernameQuery, [username], (error, usernameResults) => {
        if (error) {
            // Handle the error
            console.error(error);
            res.redirect('/profile/edit');
        } else if (usernameResults.length > 0) {
            // Username already exists
            res.render('components/accountMenu/editProfile', {
                status: validateLoginStatus(req),
                username: returnUsername(req),
                email: returnEmail(req),
                name: returnName(req),
                errorMessage: 'Username already exists.'
            });
        } else {
            // Check if the email is already in use
            pool.query(emailQuery, [email], (error, emailResults) => {
                if (error) {
                    // Handle the error
                    console.error(error);
                    res.redirect('/profile/edit');
                } else if (emailResults.length > 0) {
                    // Email already in use
                    res.render('components/accountMenu/editProfile', {
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        email: returnEmail(req),
                        name: returnName(req),
                        errorMessage: 'Email is already in use.'
                    });
                } else {
                    // Check if the new password is different from the old password
                    pool.query(passwordQuery, [oldPassword], (error, passwordResults) => {
                        if (error) {
                            // Handle the error
                            console.error(error);
                            res.redirect('/profile/edit');
                        } else if (passwordResults.length > 0 && newPassword === oldPassword) {
                            // New password is the same as the old password
                            res.render('components/accountMenu/editProfile', {
                                status: validateLoginStatus(req),
                                username: returnUsername(req),
                                email: returnEmail(req),
                                name: returnName(req),
                                errorMessage: 'New password must be different from the old password.'
                            });
                        } else {
                            // Update the profile data independently
                            const updateQueries = [];

                            if (username) {
                                updateQueries.push({
                                    query: "UPDATE account SET Username = ? WHERE /* Add condition to identify the row to update */",
                                    params: [username]
                                });
                            }

                            if (newPassword) {
                                updateQueries.push({
                                    query: "UPDATE account SET Password = ? WHERE /* Add condition to identify the row to update */",
                                    params: [newPassword]
                                });
                            }

                            if (email) {
                                updateQueries.push({
                                    query: "UPDATE account SET E_mail = ? WHERE /* Add condition to identify the row to update */",
                                    params: [email]
                                });
                            }

                            if (name) {
                                updateQueries.push({
                                    query: "UPDATE account SET Nama_Lengkap = ? WHERE /* Add condition to identify the row to update */",
                                    params: [name]
                                });
                            }

                            if (updateQueries.length === 0) {
                                // No updates requested
                                res.redirect('/profile');
                            } else {
                                // Execute update queries
                                let completedUpdates = 0;

                                updateQueries.forEach(({ query, params }) => {
                                    pool.query(query, params, (error, results) => {
                                        if (error) {
                                            // Handle the error
                                            console.error(error);
                                        } else {
                                            completedUpdates++;

                                            if (completedUpdates === updateQueries.length) {
                                                // All updates completed
                                                res.redirect('/profile');
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            });
        }
    });
});


app.get('/searchresults', (req, res) => {
    console.log(req.query.search);
    const bagSearchQuery =
        'SELECT `Id_Tas`,`namaTas` FROM `tas` WHERE `namaTas` LIKE ?';
    const searchParam = '%' + req.query.search + '%';
    pool.query(bagSearchQuery, searchParam, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            const resSearch = results;
            console.log(resSearch);
            res.render('searchresults', {
                status: validateLoginStatus(req),
                username: returnUsername(req),
                search: req.query.search,
                bagsRes: resSearch
            });
        }
    });
});

app.get('/addReview', (req, res) => {
    res.render('components/accountMenu/addBagReview', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
    });
});

async function fetchRecentBags() {
    const query = `
        SELECT r.Id_Review, r.Id_Account, t.Id_Tas, t.namaTas, m.Nama_Merk, d.Nama_Designer
        FROM review r
        INNER JOIN tas t ON r.Id_Tas = t.Id_Tas
        INNER JOIN merk m ON t.Id_Merk = m.Id_Merk
        INNER JOIN designer d ON t.Id_Designer = d.Id_Designer
        ORDER BY r.Id_Review DESC
        LIMIT 3
    `;
    const result = await pool.query(query);
    return result;
}

// display recently added bag review
function fetchRecentlyAddedData() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT tas.Id_Tas, tas.namaTas, tas.Foto, account.Username, merk.Nama_Merk, designer.Nama_Designer
        FROM tas
        INNER JOIN review ON tas.Id_Tas = review.Id_Tas
        INNER JOIN account ON review.Id_Account = account.Id_Account
        INNER JOIN merk ON merk.Id_Merk = tas.Id_Merk
        INNER JOIN designer ON designer.Id_Designer = tas.Id_Designer
        ORDER BY review.Tanggal_Review DESC
        LIMIT 3
      `;

        pool.query(query, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }

            resolve(results);
        });
    });
}



app.get('/adminDashboard', async (req, res) => {
    try {
        const data = {};

        const followerData = await fetchFollowerCount();
        data.followerData = followerData;

        const bagData = await fetchBrandBagList();
        data.bagData = bagData;

        const totalBags = await fetchTotalBags();
        data.totalBags = totalBags;

        const totalCategories = await fetchTotalCategories();
        data.totalCategories = totalCategories;

        const totalDesigners = await fetchTotalDesigners();
        data.totalDesigners = totalDesigners;

        const totalReviews = await fetchTotalReviews();
        data.totalReviews = totalReviews;

        const averageReviewValue = await fetchAverageReviewValue();
        data.averageReviewValue = averageReviewValue;

        const lowestRating = await fetchLowestRating();
        data.lowestRating = lowestRating;

        const totalSubcategories = await fetchTotalSubcategories();
        data.totalSubcategories = totalSubcategories;

        const totalAccounts = await fetchTotalAccounts();
        data.totalAccounts = totalAccounts;

        const recentlyAddedData = await fetchRecentlyAddedData();
        // console.log(recentlyAddedData)
        data.recentlyAddedData = recentlyAddedData;

        res.render('adminDashboard', {
            data,
            status: validateLoginStatus(req),
            username: returnUsername(req),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
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
        async function doThing() {
            let brandId, desigId;
            const brandIdQuery = await new Promise((resolve, reject) => {
                pool.query('SELECT `Id_Merk` FROM `merk` WHERE Nama_Merk=?', bagBrand, (error, results) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send('Error finding brand.');
                        reject(error);
                    }
                    else {
                        // console.log(results.RowDataPacket);
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                });
            });

            // console.log('test2');
            brandId = brandIdQuery[0].Id_Merk;
            if (bagDesigner === '') {
                desigId = null;
            }
            else {
                const desigIdQuery = await new Promise((resolve, reject) => {
                    pool.query('SELECT `Id_Designer` FROM `designer` WHERE Nama_Designer=?', bagDesigner, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding designer.');
                            reject(error);
                        }
                        else {
                            // console.log(results.RowDataPacket);
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                desigId = desigIdQuery[0].Id_Designer;
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

// Category sudah work, tinggal 2 menu diatas ini saja
app.post('/addCategory', (req, res) => {
    const category = req.body.categoryIn;
    const subCategory = req.body['sub-categoryIn'];

    // Check if category exists
    pool.query('SELECT `Id_Kategori` FROM `kategori` WHERE `Nama_Kategori` = ?', [category], (error, results) => {
        if (error) {
            console.log(error);
        } else if (results.length > 0) {
            // Category exists, check if subcategory exists
            const idKategori = results[0].Id_Kategori;
            pool.query('SELECT `Id_Subkategori` FROM `sub_kategori` WHERE `Nama_Subkategori` = ? AND `Id_Kategori` = ?', [subCategory, idKategori], (error, results) => {
                if (error) {
                    console.log(error);
                } else if (results.length > 0) {
                    // Subcategory exists, do nothing
                    res.redirect('back');
                } else {
                    // Subcategory does not exist, insert subcategory
                    pool.query('INSERT INTO `sub_kategori`(`Nama_Subkategori`, `Id_Kategori`) VALUES (?, ?)', [subCategory, idKategori], (error, results) => {
                        if (error) {
                            console.log(error);
                        } else {
                            res.redirect('back');
                        }
                    });
                }
            });
        } else {
            // Category does not exist, insert category
            pool.query('INSERT INTO `kategori`(`Nama_Kategori`) VALUES (?)', [category], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    res.redirect('back');
                }
            });
        }
    });
});

// Multer upload instance ada diatas
// Import "tas" from CSV file
app.post('/importTable', upload.single('bagsData'), (req, res) => {
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const query = `
        INSERT INTO tas (namaTas, Deskripsi, Warna, Dimensi)
        VALUES ('${row.namaTas}', '${row.Deskripsi}', '${row.Warna}', '${row.Dimensi}')
      `;

            pool.query(query, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Internal server error' });
                }
            });
        })
        .on('end', () => {
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error(error);
                }
            });

            return res.status(200).json({ message: 'Import successful' });
        });
});

// Export the "tas" table as CSV
app.get('/exportTable', (req, res) => {
    const query = `
    SELECT Id_Tas, namaTas, Deskripsi, Warna, Dimensi, Id_Merk, Id_Designer, Id_Subkategori
    FROM tas
  `;

    pool.query(query, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const csvData = results.map((row) => Object.values(row).join(','));

        fs.writeFile('tas.csv', csvData.join('\n'), (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.download('tas.csv', 'tas.csv', (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                fs.unlink('tas.csv', (error) => {
                    if (error) {
                        console.error(error);
                    }
                });
            });
        });
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
app.get('/bag/:number', (req, res) => {
    const getBag = 'SEARCH * FROM `tas` WHERE `Id_Tas` = ?';
    pool.query(getBag, req.params.number, (error, results) => {
        if (error) {
            console.log(error);
        } else {

        }
    });
    res.render('components/bagsData/bagPost', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
    });
})