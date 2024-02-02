const express = require("express");
const bodyParser = require("body-parser"); // Fix the typo here
const url = require("url");
const app = express();

let sql;

const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database('./quote.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

app.use(bodyParser.json());

app.post('/quote', (req, res) => {
    try {
        // console.log(req.body.movie);
        const {movie, quote, character} = req.body;
        sql = "INSERT INTO quote(movie, quote, character) VALUES(?,?,?)";
        db.run(sql,[movie,quote,character], (err)=>{
            if(err) return(res.json({
                status: 300,
                success: false,
                error: err
            }))

            console.log("Successful input", movie,quote,character);
        });
        return res.json({
            status: 200,
            success: true,
        });
    } catch (error) {
        return res.json({
            status: 400, success: false
        });
    }
});
// GET
app.get("/quote", (req,res)=>{
    sql = "SELECT * from quote";
    try {
        const queryObject = url.parse(req.url, true).query;
        console.log(queryObject.field, queryObject.type);
        if(queryObject.field&&queryObject.type) sql+=` WHERE ${queryObject.field}
         LIKE '%${queryObject.type}'`
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

const port = process.env.PORT||3000;
app.listen(port, ()=>console.log(`app is listening on http://localhost:${port}`));
