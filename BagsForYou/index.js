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

app.get('/', (req, res) => {
    // Global value untuk akun yang sudah logged in
    const id_account = req.session.id_account;
    const username = req.session.username;
    const email = req.session.email;
    const nama_lengkap = req.session.nama_lengkap;
    const is_admin = req.session.is_admin;

    let statusValidation = validateLoginStatus(req);
    let usernameValidation = returnUsername(req);

    res.render('home', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
    });
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
                        usernamePage:returnUsername(req)
                    });
                }
            });
        }
    });


});


app.get('/profile/self/following', (req, res) => {
    const followingQuery = "SELECT a.`Username`,a.`Id_Account` FROM `follow` AS f INNER JOIN `account` AS a ON f.`Id_Account` = a.`Id_Account` WHERE f.`Id_Follower` = ?";
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
                        usernamePage:returnUsername(req)
                    });
                }
            });
        }
    });
});

// index.js

// index.js
app.get('/profile', (req, res) => {
    const id_account = req.cookies.id_account;
    const getReviewObj = 'SELECT DISTINCT(`Id_Review`), `Isi_Review`, `Bintang`, `Id_Account`, `tas`.`namaTas`, `tas`.`Foto` FROM `review` INNER JOIN `tas` WHERE Id_Account = ?';

    pool.query(getReviewObj, id_account, (error, results) => {
        if (error) {
            console.log(error);
        } 
        else{
            async function getFollow(){
                const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
                const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
                const getfollowerCount= await new Promise((resolve,reject)=>{
                    pool.query(followerQuery,id_account,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getfollowingCount= await new Promise((resolve,reject)=>{
                    pool.query(followingQuery,id_account,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                return [getfollowerCount[0].followerCount,getfollowingCount[0].followingCount];
            }
            if (results.length > 0) {
                const reviews = results;
                getFollow().then(x=>{
                    const followInfo=x;
                    res.render('components/accountMenu/profile-self', {
                        postResult: reviews,
                        reviews: reviews,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        follow:followInfo
                    });
                });
            } else {
                getFollow().then(x=>{
                    const followInfo=x;
                    res.render('components/accountMenu/profile-self', {
                        postResult: null,
                        status: validateLoginStatus(req),
                        username: returnUsername(req),
                        follow:followInfo
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
        const warna = req.query.warna? req.query.warna: '%';
        const subkategori= req.query.subcategory? req.query.subcategory: '%';
        let kategori= req.query.category? req.query.category: '%';
        if(req.query.subcategory){
            const currCat=await new Promise ((resolve,reject)=>{pool.query('SELECT * FROM `sub_kategori` INNER JOIN `kategori`ON `kategori`.`Id_Kategori`=`sub_kategori`.`Id_Kategori` WHERE `sub_kategori`.`Nama_Subkategori`=?',req.query.subcategory, (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                });
            });
            kategori=currCat[0].Nama_Kategori;
        }
        const merk=req.query.brand? req.query.brand: '%';
        const searchParam=[search,subkategori,kategori,warna,merk];
        const searchQuery=await new Promise ((resolve,reject)=>{pool.query(bagSearchQuery, searchParam, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const catQuery=await new Promise ((resolve,reject)=>{pool.query('SELECT * FROM `kategori`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const subcatQuery=await new Promise ((resolve,reject)=>{pool.query('SELECT * FROM `sub_kategori`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const warnaQuery=await new Promise ((resolve,reject)=>{pool.query('SELECT DISTINCT `Warna` FROM `tas` ORDER BY `Warna`', (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
        const brandQuery=await new Promise ((resolve,reject)=>{pool.query('SELECT * FROM `merk`', (error, results) => {
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
            category: kategori==='%'?'':kategori,
            subcategory:req.query.subcategory,
            warna:req.query.warna,
            colors: warnaQuery,
            categories: catQuery,
            subcategories: subcatQuery,
            brands:brandQuery
        });
        // console.log(searchParam);
    }
});

app.get('/addReview', (req, res) => {
    res.render('components/accountMenu/addBagReview', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
    });
});
app.post('/addReview', (req, res) => {
    console.log(req.body);
    const addReviewQuery='INSERT INTO `review` (`Isi_Review`,`Bintang`,`Tanggal_Review`,`Id_Account`,`Id_Tas`) VALUES (?,?,(SELECT CURDATE()),(SELECT `Id_Account`FROM `account` WHERE `Username`=?),(SELECT `Id_Tas`FROM `tas` WHERE `namaTas`=?));'
    const addReviewQueryParam=[req.body.reviewdescription,req.body.rate,req.body.username,req.body.bagname];
    pool.query(addReviewQuery, addReviewQueryParam, (error, results) => {
        if (error) {
            console.log(error);
        }
        else{
            console.log('review added');
        }
    });
});

app.get('/adminDashboard', (req, res) => {
    res.render('adminDashboard', {
        status: validateLoginStatus(req),
        username: returnUsername(req),
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
        const searchRev = req.params.search==='none'?'%':'%' + req.params.search + '%';
        const searchQuery=await new Promise ((resolve,reject)=>{
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
                    async function getUsername(){
                        const getUsernameQuery="SELECT * FROM `account` WHERE `Id_Account` = ?";
                        const getUsername= await new Promise((resolve,reject)=>{
                            pool.query(getUsernameQuery,req.params.number,(error,results)=>{
                                if(error){
                                    console.log(error);
                                    res.status(500).send('Error finding username.');
                                    reject(error);
                                }
                                else{
                                    resolve(JSON.parse(JSON.stringify(results)));
                                }
                            });
                        });
                        // console.log(followers);
                        res.render('components/accountMenu/follower', {
                            followers,
                            followingCount,
                            status: validateLoginStatus(req),
                            usernamePage: getUsername[0].Username,
                            username: returnUsername(req),
                            idPage:getUsername[0].Id_Account
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
                    async function getUsername(){
                        const getUsernameQuery="SELECT * FROM `account` WHERE `Id_Account` = ?";
                        const getUsername= await new Promise((resolve,reject)=>{
                            pool.query(getUsernameQuery,req.params.number,(error,results)=>{
                                if(error){
                                    console.log(error);
                                    res.status(500).send('Error finding username.');
                                    reject(error);
                                }
                                else{
                                    resolve(JSON.parse(JSON.stringify(results)));
                                }
                            });
                        });
                        res.render('components/accountMenu/following', {
                            following,
                            usernamePage: getUsername[0].Username,
                            followerCount,
                            status: validateLoginStatus(req),
                            username: returnUsername(req),
                            idPage:getUsername[0].Id_Account
                        });
                    }
                    
                }
            });
        }
    });
});


app.get('/profile/:number', (req, res) => {
    const getReviewObj = 'SELECT DISTINCT(`Id_Review`), `Isi_Review`, `Bintang`, `Id_Account`, `tas`.`namaTas`, `tas`.`Foto` FROM `review` INNER JOIN `tas` WHERE Id_Account = ?';
    const accountLoggedIn = req.cookies.id_account;
    pool.query(getReviewObj, req.params.number, (error, results) => {
        if (error) {
            console.log(error);
        } 
        else{
            async function getFollow(){
                const followerQuery = "SELECT COUNT(*) AS followerCount FROM `follow` WHERE `Id_Account` = ?";
                const followingQuery = "SELECT COUNT(*) AS followingCount FROM `follow` WHERE `Id_Follower` = ?";
                const getUsernameQuery="SELECT `Username` FROM `account` WHERE `Id_Account` = ?";
                const getfollowerCount= await new Promise((resolve,reject)=>{
                    pool.query(followerQuery,req.params.number,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getfollowingCount= await new Promise((resolve,reject)=>{
                    pool.query(followingQuery,req.params.number,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding bag.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const getUsername= await new Promise((resolve,reject)=>{
                    pool.query(getUsernameQuery,req.params.number,(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding username.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                const check= await new Promise((resolve,reject)=>{
                    const checkFol="SELECT * FROM `follow` WHERE `Id_Account`=? AND `Id_Follower`=?";
                    pool.query(checkFol,[req.params.number,accountLoggedIn],(error,results)=>{
                        if(error){
                            console.log(error);
                            res.status(500).send('Error finding username.');
                            reject(error);
                        }
                        else{
                            resolve(JSON.parse(JSON.stringify(results)));
                        }
                    });
                });
                // console.log(check); console.log([accountLoggedIn,req.params.number]);
                return [getfollowerCount[0].followerCount,getfollowingCount[0].followingCount,getUsername[0].Username,check.length];
            }
            if (results.length > 0) {
                const reviews = results;
                getFollow().then(x=>{
                    const followInfo=x;
                    // console.log(followInfo[3]>0?true:false);
                    res.render('components/accountMenu/profile-other', {
                        postResult: reviews,
                        reviews: reviews,
                        status: validateLoginStatus(req),
                        usernamePage: followInfo[2],
                        username: returnUsername(req),
                        follow:followInfo,
                        accountId:req.params.number,
                        followStatus: followInfo[3]>0?true:false
                    });
                });
            } else {
                getFollow().then(x=>{
                    const followInfo=x;
                    res.render('components/accountMenu/profile-other', {
                        postResult: null,
                        status: validateLoginStatus(req),
                        usernamePage: followInfo[2],
                        username: returnUsername(req),
                        follow:followInfo,
                        followStatus: followInfo[3]>0?true:false
                    });
                });
            }
        }
    });
});

app.get('/unfollow/:number',(req, res) =>{
    const accountLoggedIn = req.cookies.id_account;
    async function getUnFollow(){
        const addFollowerQuery = "DELETE FROM `follow` WHERE `Id_Account`=? AND `Id_Follower`=?";
        const followAdd= await new Promise((resolve,reject)=>{
            pool.query(addFollowerQuery,[req.params.number,accountLoggedIn],(error,results)=>{
                if(error){
                    console.log(error);
                    res.status(500).send('Error following.');
                    reject(error);
                }
                else{
                    resolve('success');
                }
            });
            
        });
        res.redirect('/profile/'+req.params.number);
    }
    getUnFollow();
});

app.get('/follow/:number',(req, res) =>{
    const accountLoggedIn = req.cookies.id_account;
    async function getFollow(){
        const addFollowerQuery = "INSERT INTO `follow`(`Id_Account`,`Id_Follower`) VALUES (?,?)";
        const followAdd= await new Promise((resolve,reject)=>{
            pool.query(addFollowerQuery,[req.params.number,accountLoggedIn],(error,results)=>{
                if(error){
                    console.log(error);
                    res.status(500).send('Error following.');
                    reject(error);
                }
                else{
                    resolve('success');
                }
            });
            
        });
        res.redirect('/profile/'+req.params.number);
    }
    getFollow();
});