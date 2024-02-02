// const bodyParser = require('body-parser')
// const  express = require('express');
// const app = express()
// const sqlite = require('sqlite3').verbose()
// // let sql;
// const db = new sqlite.Database('./quote.db',sqlite.OPEN_READWRITE,(err) => {
//     if(err){
//         return console.error(err)
//     }
// })

// app.use(bodyParser.json())


// app.post('/quote',(req,res) => {
//     try {
//         const {movie,quote,character} = req.body;
//         sql = "INSERT INTO quote(movie,quote,character) VALUES (?,?,?)";
//         db.run(sql,[movie,quote,character], (err) => {
//             if(err){
//                 return  res.json({status : 300, success :  false , error: err})
//             }
//             console.log('Successful input:', movie, quote, character);
//             res.json({ status: 200, success: true });
//         })
//         res.json({
//             status : 200,
//             success : true
//         })
//     } catch (error) {
//         return res.json({
//             status : 400,
//             success : false
//         })
//     }
// })

// app.post('/quote', (req, res) => {
//     try {
//         // console.log(req.body.movie);
//         const {movie, quote, character} = req.body;
//         let sql = "INSERT INTO quote(movie, quote, character) VALUES(?,?,?)";
//         db.run(sql,[movie,quote,character], (err)=>{
//             if(err) return(res.json({
//                 status: 300,
//                 success: false,
//                 error: err
//             }))

//             console.log("Successful input", movie,quote,character);
//         });
//         return res.json({
//             status: 200,
//             success: true,
//         });
//     } catch (error) {
//         return res.json({
//             status: 400, success: false
//         });
//     }
// });

// app.listen(3000)


// const bodyParser = require('body-parser');
// const express = require('express');
// const app = express();
// const sqlite = require('sqlite3').verbose();

// const db = new sqlite.Database('./quote.db', sqlite.OPEN_READWRITE, (err) => {
//     if (err) {
//         console.error(err);
//     }
// });

// app.use(bodyParser.json());

// app.post('/quote', (req, res) => {
//     try {
//         const { movie, quote, character } = req.body;
//         let sql = "INSERT INTO quote(movie, quote, character) VALUES (?, ?, ?)";
//         db.run(sql, [movie, quote, character], (err) => {
//             if (err) {
//                 console.error('Error inserting into database:', err);
//                 return res.json({ status: 300, success: false, error: err });
//             }
//             console.log('Successful input:', movie, quote, character);
//             res.json({ status: 200, success: true });
//         });
//     } catch (error) {
//         console.error('Error processing request:', error);
//         return res.json({ status: 400, success: false });
//     }
// });

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });



const express = require("express");
const bodyParser = require("body-parser");
const url = require("url");
const app = express();

let sql;
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./bookStore.db", sqlite.OPEN_READWRITE, (err)=>{
    if(err) return console.error(err);
});

app.use(bodyParser.json());

app.post('/api/books', (req, res)=>{
    try {
        const {title, author, genre, price} = req.body;
        sql = "INSERT INTO bookStore(title, author, genre, price) VALUES(?,?,?,?)";
        db.run(sql, [title,author,genre,price], (err)=>{
            if(err) return(res.json({
                status: 300,
                success: false,
                error: err
            }))

            console.log("Successful input", title, author, genre, price);
        })
    } catch (error) {
        return res.json({
            status: 400, success: false
        });
    }
})

app.get("/api/books", (req,res)=>{
    sql = "SELECT * from bookStore";
    try {
        // const queryObject = url.parse(req.url, true).query;
        // console.log(queryObject.field, queryObject.type);
        // if(queryObject.field&&queryObject.type) sql+=` WHERE ${queryObject.field}
        //  LIKE '%${queryObject.type}'`
        db.all(sql, [], (err, rows)=>{
            if(err) return(res.json({
                status: 300,
                success: false,
                error: err
            }))

            if(rows.length<1) return(res.json({
                status: 300,
                success: false,
                error: "No match"
            }))

            return res.json({status: 200, data: rows, success: true})
        })
        
    } catch (error) {
        return res.json({
            status: 400, success: false
        });
    }
})


const port = process.env.PORT||5000;
app.listen(port, ()=>console.log(`app is listening on http://localhost:${port}`));