import express, { response } from 'express';
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
// const upload = multer({ storage: storage });

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
    const followerQuery = "SELECT a.`Username`,a.`Id_Account` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Follower` = a.`Id_Account` WHERE f.`Id_Account` = ?";
    const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
    const accountLoggedIn = req.cookies.id_account;

    pool.query(followerQuery, [accountLoggedIn], (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const followers = results;

            pool.query(followingQuery, [accountLoggedIn], (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    const followingCount = results[0].followingCount;

                    res.render('components/accountMenu/follower', {
                        followers,
                        followingCount,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        usernamePage: returnUsername(req)
                    });
                }
            });
        }
    });


});

app.get('/profile/self/following', (req, res) => {
    const followingQuery = "SELECT a.`Username`,a.`Id_account` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Account` = a.`Id_Account` WHERE f.`Id_Follower` = ?";
    const accountLoggedIn = req.cookies.id_account;
    const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
    pool.query(followingQuery, [accountLoggedIn], (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const following = results;

            pool.query(followerQuery, [accountLoggedIn], (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    const followerCount = results[0].followerCount;
                    console.log(following);
                    res.render('components/accountMenu/following', {
                        following,
                        followerCount,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        usernamePage: returnUsername(req)
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
        }
        else {
            async function getFollow() {
                const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
                const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
                const getfollowerCount = await new Promise((resolve, reject) => {
                    pool.query(followerQuery, id_account, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else {
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getfollowingCount = await new Promise((resolve, reject) => {
                    pool.query(followingQuery, id_account, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else {
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                return [getfollowerCount[0].followerCount, getfollowingCount[0].followingCount];
            }
            if (results.length > 0) {
                const reviews = results;
                getFollow().then(x => {
                    const followInfo = x;
                    res.render('components/accountMenu/profile-self', {
                        postResult: reviews,
                        reviews: reviews,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        follow: followInfo
                    });
                });
            } else {
                getFollow().then(x => {
                    const followInfo = x;
                    res.render('components/accountMenu/profile-self', {
                        postResult: reviews,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        follow: followInfo
                    });
                });
            }
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

    // Define the returnEmail and returnName functions
    function returnEmail(req) {
        return req.body.email;
    }

    function returnName(req) {
        return req.body.name;
    }

    // Perform validation checks
    const usernameQuery = "SELECT Username FROM account WHERE Username = ?";
    const emailQuery = "SELECT E_mail FROM account WHERE E_mail = ?";
    const passwordQuery = "SELECT Password FROM account WHERE Username = ?";

    // Check if the username already exists
    pool.query(usernameQuery, [username], (error, usernameResults) => {
        if (error) {
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
                    pool.query(passwordQuery, [returnUsername(req)], (error, passwordResults) => {
                        if (error) {
                            console.error(error);
                            res.redirect('/profile/edit');
                        } else if (passwordResults.length === 0 || passwordResults[0].Password !== oldPassword) {
                            // Old password does not match
                            res.render('components/accountMenu/editProfile', {
                                status: validateLoginStatus(req),
                                username: returnUsername(req),
                                email: returnEmail(req),
                                name: returnName(req),
                                errorMessage: 'Old password is incorrect.'
                            });
                        } else if (newPassword !== newPasswordValidation) {
                            // New password and confirmation do not match
                            res.render('components/accountMenu/editProfile', {
                                status: validateLoginStatus(req),
                                username: returnUsername(req),
                                email: returnEmail(req),
                                name: returnName(req),
                                errorMessage: 'New password and confirmation do not match.'
                            });
                        } else {
                            // Update the profile data independently
                            const updateQueries = [];

                            if (username) {
                                updateQueries.push({
                                    query: "UPDATE account SET Username = ? WHERE Username = ?",
                                    params: [username, returnUsername(req)]
                                });
                            }

                            if (newPassword) {
                                updateQueries.push({
                                    query: "UPDATE account SET Password = ? WHERE Username = ?",
                                    params: [newPassword, returnUsername(req)]
                                });
                            }

                            if (email) {
                                updateQueries.push({
                                    query: "UPDATE account SET E_mail = ? WHERE Username = ?",
                                    params: [email, returnUsername(req)]
                                });
                            }

                            if (name) {
                                updateQueries.push({
                                    query: "UPDATE account SET Nama_Lengkap = ? WHERE Username = ?",
                                    params: [name, returnUsername(req)]
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
                                            console.error(error);
                                        } else {
                                            completedUpdates++;

                                            if (completedUpdates === updateQueries.length) {
                                                res.send(`
                                                    <script>
                                                        alert('Data akun diubah, silahkan login kembali');
                                                        window.location.href = '/logout';
                                                        window.location.href = '/login';
                                                    </script>
                                                `);
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
    getSearch();
    async function getSearch() {
        // console.log(req.query);
        const bagSearchQuery = `
SELECT tas.Id_Tas ,tas.namaTas,tas.Foto
FROM tas 
INNER JOIN sub_kategori ON sub_kategori.Id_Subkategori=tas.Id_Subkategori
INNER JOIN kategori ON kategori.Id_Kategori=sub_kategori.Id_Kategori
INNER JOIN merk ON merk.Id_Merk=tas.Id_Tas
WHERE namaTas LIKE ? 
AND sub_kategori.Nama_Subkategori LIKE ? 
AND kategori.Nama_Kategori LIKE ? 
AND tas.Warna LIKE ?
AND merk.Nama_Merk LIKE ?`;
        const search = '%' + req.query.search + '%';
        const warna = req.query.warna ? req.query.warna : '%';
        const subkategori = req.query.subcategory ? req.query.subcategory : '%';
        let kategori = req.query.category ? req.query.category : '%';
        if (req.query.subcategory) {
            const currCat = await new Promise((resolve, reject) => {
                pool.query('SELECT * FROM `sub_kategori` INNER JOIN `kategori`ON `kategori`.`Id_Kategori`=`sub_kategori`.`Id_Kategori` WHERE `sub_kategori`.`Nama_Subkategori`=?', req.query.subcategory, (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                });
            });
            kategori = currCat[0].Nama_Kategori;
        }
        const merk = req.query.brand ? req.query.brand : '%';
        const searchParam = [search, subkategori, kategori, warna, merk];
        const searchQuery = await new Promise((resolve, reject) => {
            pool.query(bagSearchQuery, searchParam, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const catQuery = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM `kategori`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const subcatQuery = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM `sub_kategori`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const warnaQuery = await new Promise((resolve, reject) => {
            pool.query('SELECT DISTINCT `Warna` FROM `tas` ORDER BY `Warna`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const brandQuery = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM `merk`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        res.render('searchresults', {
            status: validateLoginStatus(req),
            username: returnUsername(req),
            search: req.query.search,
            bagsRes: searchQuery,
            brand: req.query.brand,
            category: kategori === '%' ? '' : kategori,
            subcategory: req.query.subcategory,
            warna: req.query.warna,
            colors: warnaQuery,
            categories: catQuery,
            subcategories: subcatQuery,
            brands: brandQuery
        });
        // console.log(searchParam);
    }
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
app.post('/addReview', (req, res) => {
    console.log(req.body);
    const addReviewQuery = `
        INSERT INTO review (Isi_Review, Bintang, Tanggal_Review, Id_Account, Id_Tas)
        SELECT ?, ?, CURDATE(), (SELECT Id_Account FROM account WHERE Username=? LIMIT 1),
               (SELECT Id_Tas FROM tas WHERE namaTas=? LIMIT 1);`;
    const addReviewQueryParam = [req.body.reviewdescription, req.body.rate, req.body.username, req.body.bagname];
    pool.query(addReviewQuery, addReviewQueryParam, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            // console.log('review added');
            res.send(`
            <script>
                alert('Review Added');
                window.location.href = '/';
            </script>
            `);
        }
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
        pool.query(
            'SELECT `Username`, `E_mail` FROM `account` WHERE `Username` = ? OR `E_mail` = ?',
            [username, email],
            (error, results) => {
                if (error) {
                    console.log(error);
                } else if (results.length > 0) {
                    res.render('signup', {
                        errorMsg:
                            `Username or email already exists. \n Please choose a different username or email.`,
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
            }
        );
    }
});


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
        getBrandDesignerId();
        async function getBrandDesignerId() {
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
                    console.log(bagId);
                    const selectQuery = 'SELECT * FROM `tas` WHERE `Id_Tas` = ?';
                    pool.query(selectQuery, [bagId], (error, bagData) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error retrieving bag data.');
                        } else {
                            res.send(`
                                <script>
                                    alert('Review Added');
                                    window.location.href = '/adminDashboard';
                                </script>
                                `);
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
                            res.redirect('adminDashboard');
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
                    res.send(`
            <script>
                alert('Category Added');
                window.location.href = '/adminDashboard';
            </script>
            `);
                }
            });
        }
    });
});

// Multer upload instance ada diatas
// TODO IMPORT TABLE, EXPORT TABLE IS WORKING!
const upload = multer({ dest: 'uploads/' }); // Specify the folder where uploaded files will be stored

app.post('/importTable', upload.single('bagsData'), (req, res) => {
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Rest of the code remains the same
        })
        .on('end', () => {
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error(error);
                }
            });
            res.send(`
            <script>
                alert('Import successful');
                window.location.href = '/adminDashboard';
            </script>
            `);
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
    getBag();
    async function getBag() {
        const getBagQuery = 'SELECT `tas`.* ,`kategori`.`Nama_Kategori`,sub_kategori.Nama_Subkategori FROM `tas` INNER JOIN `sub_kategori` ON `sub_kategori`.`Id_Subkategori`=`tas`.`Id_Subkategori` INNER JOIN `kategori`ON `sub_kategori`.`Id_Kategori`=`kategori`.`Id_Kategori` WHERE `Id_Tas` = ?';
        const getbagInfo = await new Promise((resolve, reject) => {
            pool.query(getBagQuery, req.params.number, (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Error finding bag.');
                    reject(error);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        let bag = getbagInfo[0];
        const getReviewQuery = 'SELECT `review`.*,`account`.`Username` FROM `review` INNER JOIN `account` ON `review`.`Id_Account`=`account`.`Id_Account`WHERE `Id_Tas` = ?';
        const getReviewInfo = await new Promise((resolve, reject) => {
            pool.query(getReviewQuery, req.params.number, (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Error finding review.');
                    reject(error);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        let reviews = getReviewInfo;
        const getAvgStar = await new Promise((resolve, reject) => {
            pool.query('SELECT ROUND(AVG(`Bintang`),1)AS AvgBintang FROM `review` WHERE `Id_Tas`=?', req.params.number, (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Error finding avg stars.');
                    reject(error);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const avgStar = getAvgStar[0].AvgBintang;
        // console.log(avgStar);
        res.render('components/bagsData/bagPost', {
            status: validateLoginStatus(req),
            username: returnUsername(req),
            bag: bag,
            reviews: reviews,
            average: avgStar,
            displayStar: Math.floor(avgStar)
        });
    }
})
app.get('/reviewSearch/:search', (req, res) => {
    getSearchRev();
    async function getSearchRev() {
        console.log(req.params);
        const bagSearchQueryRev = `
SELECT tas.Id_Tas ,tas.namaTas,tas.Foto
FROM tas 
WHERE namaTas LIKE ? `;
        const searchRev = req.params.search === 'none' ? '%' : '%' + req.params.search + '%';
        const searchQuery = await new Promise((resolve, reject) => {
            pool.query(bagSearchQueryRev, searchRev, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        res.json(searchQuery);
        // console.log(searchParam);
    }
})

app.get('/profile/:number/follower', (req, res) => {
    const followerQuery = "SELECT a.`Username`, a.`Id_Account` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Follower` = a.`Id_Account` WHERE f.`Id_Account` = ?";
    const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
    const accountLoggedIn = req.cookies.id_account;

    pool.query(followerQuery, req.params.number, (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const followers = results;

            pool.query(followingQuery, req.params.number, (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    const followingCount = results[0].followingCount;

                    getUsername();
                    async function getUsername() {
                        const getUsernameQuery = "SELECT * FROM `account` WHERE `Id_Account` = ?";
                        const getUsername = await new Promise((resolve, reject) => {
                            pool.query(getUsernameQuery, req.params.number, (error, results) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).send('Error finding username.');
                                    reject(error);
                                }
                                else {
                                    resolve(JSON.parse(JSON.stringify(results)));
                                }
                            });
                        });
                        console.log(followers);
                        res.render('components/accountMenu/follower', {
                            followers,
                            followingCount,
                            status: validateLoginStatus(req),
                            usernamePage: getUsername[0].Username,
                            username: returnUsername(req),
                            idPage: getUsername[0].Id_Account
                        });
                    }
                }
            });
        }
    });
});


app.get('/profile/:number/following', (req, res) => {
    const followingQuery = "SELECT a.`Username`,a.`Id_Account` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Account` = a.`Id_Account` WHERE f.`Id_Follower` = ?";
    const accountLoggedIn = req.cookies.id_account;
    const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
    pool.query(followingQuery, req.params.number, (err, results) => {
        if (err) {
            // Handle the error appropriately
            console.error(err);
        } else {
            const following = results;

            pool.query(followerQuery, req.params.number, (err, results) => {
                if (err) {
                    // Handle the error appropriately
                    console.error(err);
                } else {
                    const followerCount = results[0].followerCount;

                    getUsername();
                    async function getUsername() {
                        const getUsernameQuery = "SELECT * FROM `account` WHERE `Id_Account` = ?";
                        const getUsername = await new Promise((resolve, reject) => {
                            pool.query(getUsernameQuery, req.params.number, (error, results) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).send('Error finding username.');
                                    reject(error);
                                }
                                else {
                                    resolve(JSON.parse(JSON.stringify(results)));
                                }
                            });
                        });
                        console.log(following[0].Id_Account);
                        res.render('components/accountMenu/following', {
                            following,
                            usernamePage: getUsername[0].Username,
                            followerCount,
                            status: validateLoginStatus(req),
                            username: returnUsername(req),
                            idPage: getUsername[0].Id_Account
                        });
                    }

                }
            });
        }
    });
});


app.get('/profile/:number', (req, res) => {
    const getReviewObj = 'SELECT DISTINCT(`Id_Review`), `Isi_Review`, `Bintang`, `Id_Account`, `tas`.`namaTas`, `tas`.`Foto` FROM `review` INNER JOIN `tas` WHERE Id_Account = ?';

    pool.query(getReviewObj, req.params.number, (error, results) => {
        if (error) {
            console.log(error);
        }
        else {
            async function getFollow() {
                const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
                const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
                const getUsernameQuery = "SELECT `Username` FROM `account` WHERE `Id_Account` = ?";
                const getfollowerCount = await new Promise((resolve, reject) => {
                    pool.query(followerQuery, req.params.number, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else {
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getfollowingCount = await new Promise((resolve, reject) => {
                    pool.query(followingQuery, req.params.number, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else {
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getUsername = await new Promise((resolve, reject) => {
                    pool.query(getUsernameQuery, req.params.number, (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error finding username.');
                            reject(error);
                        }
                        else {
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                return [getfollowerCount[0].followerCount, getfollowingCount[0].followingCount, getUsername[0].Username];
            }
            if (results.length > 0) {
                const reviews = results;
                getFollow().then(x => {
                    const followInfo = x;
                    res.render('components/accountMenu/profile-other', {
                        postResult: reviews,
                        reviews: reviews,
                        status: validateLoginStatus(req),
                        usernamePage: followInfo[2],
                        username: returnUsername(req),
                        follow: followInfo,
                        accountId: req.params.number
                    });
                });
            } else {
                getFollow().then(x => {
                    const followInfo = x;
                    res.render('components/accountMenu/profile-other', {
                        postResult: null,
                        status: validateLoginStatus(req),
                        usernamePage: followInfo[2],
                        username: returnUsername(req),
                        follow: followInfo
                    });
                });
            }
        }
    });
});