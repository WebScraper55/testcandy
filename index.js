const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();
const util = require('util');
app.use(cors());
app.use(express.json());



const db = mysql.createConnection(process.env.DATABASE_URL);

// const db = mysql.createConnection({
//     user: "sql12671495",
//     host: "sql12.freesqldatabase.com",
//     password: "Jgatkd3qgf",
//     database: "3306"
// })

// const db = mysql.createConnection({
//     user: "root",
//     host: "localhost",
//     password: "",
//     database: "product"
// })

const query = util.promisify(db.query).bind(db);

// app.get('/product-seller', (req, res) => {
//     db.query('SELECT * FROM product_gp', (err, result) => {  
//         if (er   r) {
//             console.log(err);
//         }else {
//             res.send(result);
//         }
//     })
// })


// app.get('/product-all/:model', async (req, res) => {
//     const model = req.params.model;
//     console.log(model);
//     db.query('SELECT * FROM product WHERE MODEL = ?', [model], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Internal Server Error');
//         } else {
//             res.send(result);
//         }
//     });
// });



app.get('/product-seller', (req, res) => {
    db.query('SELECT * FROM product_grp', (err, result) => {
        if (err) {
            console.log(err);
        }else {
            res.send(result);
        }
    })
})


app.get('/product-all/:model', async (req, res) => {
    const model = req.params.model;
    console.log(model);
    db.query('SELECT * FROM product WHERE MODEL = ?', [model], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(result);
        }
    });
});


// imsert to database
app.post('/deployall-data', async (req, res) => {
    const data = await req.body.data;


    try {
        db.query('DROP TABLE IF EXISTS oall');

        db.query(`
        CREATE TABLE oall (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            MODEL VARCHAR(255),
            GRP DECIMAL(10, 2),
            CATEGORY VARCHAR(255),
            DESCRIPTION TEXT,
            NOTES TEXT,
            INI VARCHAR(255),
            PRICE DECIMAL(18, 6),
            REC DECIMAL(10, 2),
            R INT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;        
        `);

        for (const item of data) {
            console.log(item);
            const query = "INSERT INTO oall (MODEL, GRP, CATEGORY, DESCRIPTION, NOTES, INI, PRICE, REC, R)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            
            const values = [
                item.MODEL,
                item.GRP,
                item.CATEGORY,
                item.DESC,
                item.NOTES,
                item.INI,
                item.PRICE,
                item.REC,
                item.R,
            ];

           db.query(query, values);
        }

        console.log('Data inserted successfully.');
        res.send('Successfully inserted data.');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        //pool.end();
    }
});


app.post('/deployall-list', async (req, res) => {
    const data = req.body.data
    try {
        db.query('DROP TABLE IF EXISTS olist');

        await db.query(`
            CREATE TABLE olist (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                MODEL VARCHAR(255),
                DESCRIPTION TEXT,
                PRICE DECIMAL(18, 6),
                CFG TEXT,
                LN INT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
        `);

        for (const item of data) {
            const query = "INSERT INTO olist (MODEL, DESCRIPTION, PRICE, CFG, LN)VALUES (?, ?, ?, ?, ?)"

            const values = [
                item.MODEL,
                item.DESC,
                item.PRICE,
                item.CFG,
                item.LN,
            ];

            await db.query(query, values);
        }

            console.log('Data inserted successfully.');
        } catch (error) {
            console.error('Error inserting data:', error);
        } finally {
            res.send("success")
        }
    })

    app.get('/get-version' , async (req, res) => {
        await db.query("SELECT * FROM versions ORDER BY id DESC LIMIT 1", (err, result) => {
            if (err){
                console.log(err)
            }else{
                res.send(result)
            }
        })
    })

    app.post('/update-version', async (req, res) => {
        const newver = await req.body.data;
        const date = new Date();
        const upby = 'Admin';
        try {
      
          const query = "INSERT INTO versions (version, date, upby) VALUES (?, ?, ?)";
          const data = [newver.ver, date, upby];
      
          // Assuming db.query returns a promise
           await db.query(query, data);
      
          res.status(200).send("success");
        }
        catch (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        }
      });


app.listen('3000', () => {
    console.log('Server is running on port 3000');
})
