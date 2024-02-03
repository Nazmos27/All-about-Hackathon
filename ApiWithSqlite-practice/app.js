const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const url = require('url')
const sqlite = require('sqlite3').verbose()
let sql;
const db = new sqlite.Database('./quote.db',sqlite.OPEN_READWRITE, (err) => {
    if(err){
        return console.error("error cheking",err)
    }
})


app.use(bodyParser.json())

//post method

app.post('/quote', (req, res) => {
    try {
        // console.log(req.body.movie);
        const {movie, quote, character} = req.body;
        sql = "INSERT INTO quote(movie, quote, character) VALUES(?,?,?)";
        db.run(sql,[movie,quote,character],async(err)=>{
            if(err) return ( res.json({
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
        // db.run(sql, [movie, quote, character], (err) => {
        //     if (err) {
        //         console.error("Error inserting quote:", err);
        //         return res.status(500).json({
        //             success: false,
        //             error: 'Failed to insert quote into the database',
        //         });
        //     }
        //     console.log("Successful input", movie, quote, character);
        //     res.status(201).json({
        //         success: true,
        //         message: 'Quote successfully added to the database',
        //     });
        // });
        
    } catch (error) {
        return res.json({
            status: 400, success: false
        });
    }
});

app.get("/quote", (req, res) => {
    try {
        let sql = "SELECT * FROM quote";
        const queryObject = url.parse(req.url, true).query;
        console.log(queryObject.name, queryObject.value);
        const name = queryObject.name; // Extracting the query parameter name
        const value = queryObject.value; // Extracting the query parameter value
        if (name && value) {
            sql += ` WHERE ${name} LIKE ?`; // Using parameterized query to prevent SQL injection
            db.all(sql, [`%${value}%`], (err, rows) => {
                if (err) {
                    console.error("Error retrieving quotes:", err);
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        error: 'Failed to retrieve quotes from the database',
                    });
                }
                if (rows.length < 1) {
                    return res.status(200).json({
                        status: 200,
                        success: false,
                        error: "No matching quotes found",
                    });
                }
                return res.status(200).json({
                    status: 200,
                    data: rows,
                    success: true,
                });
            });
        } else {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("Error retrieving quotes:", err);
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        error: 'Failed to retrieve quotes from the database',
                    });
                }
                if (rows.length < 1) {
                    return res.status(200).json({
                        status: 200,
                        success: false,
                        error: "No quotes found in the database",
                    });
                }
                return res.status(200).json({
                    status: 200,
                    data: rows,
                    success: true,
                });
            });
        }
    } catch (error) {
        console.error("Error handling request:", error);
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad Request',
        });
    }
});
app.listen(3000)


