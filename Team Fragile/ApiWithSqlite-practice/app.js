const express = require("express");
const bodyParser = require("body-parser");
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
        const { movie, quote, character } = req.body;
        sql = "INSERT INTO quote(movie, quote, character) VALUES(?,?,?)";
        db.run(sql, [movie, quote, character], (err) => {
            if (err) {
                console.error("Error inserting quote:", err);
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: 'Failed to insert quote into the database',
                });
            }
            console.log("Successful input", movie, quote, character);
            return res.status(200).json({
                status: 200,
                success: true,
            });
        });
    } catch (error) {
        console.error("Error handling request:", error);
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad Request',
        });
    }
});

app.get("/quote", (req, res) => {
    try {
        let sql = "SELECT * FROM quote";
        const queryObject = url.parse(req.url, true).query;
        if (queryObject.field && queryObject.type) {
            sql += ` WHERE ${queryObject.field} LIKE ?`;
            db.all(sql, [`%${queryObject.type}%`], (err, rows) => {
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app is listening on http://localhost:${port}`));
