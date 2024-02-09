const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const url = require("url");
const { title } = require("process");
const router = require('express').Router();

const sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("./information.db", sqlite3.OPEN_READWRITE, function (err) {
    if (err)
        return console.error(err.message);
    console.log("Connected to the database");
});

// Drop and create table1
db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
        if (err) {
            console.error("Error dropping users:", err);
        } else {
            db.run(`CREATE TABLE users (
                user_id INTEGER,
                user_name TEXT,
                balance INTEGER
            )`, (err) => {
                if (err) {
                    console.error("Error creating users:", err);
                } else {
                    console.log("users created successfully.");
                }
            });
        }
    });

    // Drop and create table2
    db.run(`DROP TABLE IF EXISTS stations`, (err) => {
        if (err) {
            console.error("Error dropping stations:", err);
        } else {
            db.run(`CREATE TABLE stations (
                station_id INTEGER,
                station_name TEXT,
                longitude REAL,
                latitude REAL
            )`, (err) => {
                if (err) {
                    console.error("Error creating stations:", err);
                } else {
                    console.log("stations created successfully.");
                }
            });
        }
    });

    // Create train table

    db.run(`DROP TABLE IF EXISTS trains`, (err) => {
        if (err) {
            console.error("Error dropping trains:", err);
        } else {

            db.run(`CREATE TABLE trains (
                train_id INTEGER,
                train_name TEXT,
                capacity INTEGER
            )`, (err) => {
                if (err) {
                    console.error("Error creating trains:", err);
                } else {
                    console.log("trains created successfully.");
                }
            });

        }
    });

    db.run(`DROP TABLE IF EXISTS stops`, (err) => {
        if (err) {
            console.error("Error dropping stops:", err);
        } else {

            db.run(`CREATE TABLE stops (
                train_id INTEGER,
                station_id INTEGER,
                arrival_time TEXT,
                departure_time TEXT,
                fare INTEGER,
                FOREIGN KEY(train_id) REFERENCES trains(train_id)
            )`, (err) => {
                if (err) {
                    console.error("Error creating stops:", err);
                } else {
                    console.log("stops created successfully.");
                }
            });

        }
    });


    // Create stops table

});
app.use('/', router);
app.use(bodyParser.json());

//post api for users info
app.post('/api/users', (req, res) => {
    try {
        const { user_id, user_name, balance } = req.body;
        const sql = `INSERT INTO users(user_id, user_name, balance) VALUES(?,?,?)`;
        db.run(sql, [user_id, user_name, balance], function (err) {
            if (err) {
                return res.status(300).json({
                    status: 300,
                    success: false,
                    error: err
                });
            }
            const insertedId = user_id;
            const selectSql = `SELECT * FROM users WHERE user_id=?`
            db.get(selectSql, [insertedId], (err, row) => {
                if (err) {
                    return res.status(300).json({
                        status: 300,
                        success: false,
                        error: "errafdafad", err
                    });
                }

                res.status(201).json({
                    user_id: row.user_id,
                    user_name: row.user_name,
                    balance: row.balance,

                });
            })
        })

    } catch (error) {
        return res.status(400).json({
            status: 400, success: false
        });
    }
})

//post api for stations info
app.post('/api/stations', (req, res) => {
    try {
        const { station_id, station_name, longitude, latitude } = req.body;
        const sql = `INSERT INTO stations(station_id, station_name, longitude, latitude) VALUES(?,?,?,?)`;
        db.run(sql, [station_id, station_name, longitude, latitude], function (err) {
            if (err) {
                return res.status(300).json({
                    status: 300,
                    success: false,
                    error: err
                });
            }
            const insertedId = station_id;
            const selectSql = `SELECT * FROM stations WHERE station_id=?`
            db.get(selectSql, [insertedId], (err, row) => {
                if (err) {
                    return res.status(300).json({
                        status: 300,
                        success: false,
                        error: "errafdafad", err
                    });
                }

                res.status(201).json({
                    station_id: row.station_id,
                    station_name: row.station_name,
                    longitude: row.longitude,
                    latitude: row.latitude
                });
            })
        })

    } catch (error) {
        return res.status(400).json({
            status: 400, success: false
        });
    }
})


// Post api for train info
app.post('/api/trains', (req, res) => {
    try {
        const { train_id, train_name, capacity, stops } = req.body;

        // Insert train data into the 'train' table
        const insertTrainSql = `INSERT INTO trains (train_id, train_name, capacity) VALUES (?, ?, ?)`;
        db.run(insertTrainSql, [train_id, train_name, capacity], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to insert train data into the database', err });
            }
            // Insert stops data into the 'stops' table
            const insertStopSql = `INSERT INTO stops (train_id, station_id, arrival_time, departure_time, fare) VALUES (?, ?, ?, ?, ?)`;
            stops.forEach(stop => {
                db.run(insertStopSql, [train_id, stop.station_id, stop.arrival_time, stop.departure_time, stop.fare], function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to insert stops data into the database' });
                    }
                });
            });
            // res.status(201).json({ message: 'Train data inserted successfully' });
            const numStations = stops.length;
            const response = {
                train_id,
                train_name,
                capacity,
                service_start: stops[0].departure_time, // Assuming first stop's arrival time is service start time
                service_ends: stops[numStations - 1].arrival_time, // Assuming last stop's departure time is service end time
                num_stations: numStations
            };
            res.status(201).json(response);
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad request' });
    }
});

//get api for all stations info
app.get('/api/stations', (req, res) => {
    try {
        const sql = `SELECT * FROM stations ORDER BY station_id`;
        db.all(sql, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: err.message
                });
            } if (!rows) {
                return res.status(404).json({
                    status: 404,
                    error: "No Stations Found"
                })
            }
            const stations = rows.map(row => ({
                station_id: row.station_id,
                station_name: row.station_name,
                longitude: row.longitude,
                latitude: row.latitude
            }));
            res.status(200).json({ stations });
        });
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad request'
        });
    }
});

//get trains info that stops in a particular station
app.get('/api/stations/:station_id/trains', (req, res) => {
    try {
        const { station_id } = req.params;
        const checkStationSql = `SELECT COUNT(*) AS count FROM stations WHERE station_id = ?`;
        db.get(checkStationSql, [station_id], (err, row) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: err.message
                });
            }
            if (row.count === 0) {
                return res.status(404).json({
                    "message": `station with id: ${station_id} was not found`
                });
            }
            const sql = `SELECT t.train_id, t.train_name, t.capacity, s.station_id, s.arrival_time, s.departure_time, s.fare
                     FROM trains AS t
                     INNER JOIN stops AS s ON t.train_id = s.train_id
                     WHERE s.station_id = ?`;
            db.all(sql, [station_id], (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        error: err.message
                    });
                }

                const trainsByStation = {};
                rows.forEach(row => {
                    const { train_id, arrival_time, departure_time } = row;
                    if (!trainsByStation[train_id]) {
                        trainsByStation[train_id] = {
                            train_id,
                            arrival_time,
                            departure_time
                        };
                    }
                });

                const trains = Object.values(trainsByStation);

                const response = {
                    station_id: parseInt(station_id),
                    trains
                };
                res.status(200).json(response);

            });
        })
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad request'
        });
    }
});


app.get('/api/wallets/:wallet_id', (req, res) => {
    try {
        const { wallet_id } = req.params;

        // Query user information
        const sql = `SELECT user_id, user_name, balance
                     FROM users
                     WHERE user_id = ?`;
        db.get(sql, [wallet_id], (err, row) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: err.message
                });
            }
            if (!row) {
                return res.status(404).json({
                    message: `Wallet with id: ${wallet_id} was not found`
                });
            }

            const response = {
                wallet_id: row.user_id,
                balance: row.balance, // Assuming balance is a field in the users table
                wallet_user: {
                    user_id: row.user_id,
                    user_name: row.user_name
                }
            };

            res.status(200).json(response);
        });
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad request'
        });
    }
});


app.put('/api/wallets/:wallet_id', (req, res) => {
    try {
        const { wallet_id } = req.params;
        const { recharge } = req.body;

        // Check if recharge value is within the valid range
        if (recharge < 100 || recharge > 10000) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Recharge value must be between 100 and 10000 Taka'
            });
        }

        // Update balance in the "users" table
        const updateBalanceSql = `UPDATE users SET balance = balance + ? WHERE user_id = ?`;
        db.run(updateBalanceSql, [recharge, wallet_id], function (err) {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: err.message
                });
            }

            // Get updated balance
            const getBalanceSql = `SELECT balance FROM users WHERE user_id = ?`;
            db.get(getBalanceSql, [wallet_id], (err, row) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        error: err.message
                    });
                }
                const updatedBalance = row.balance;
                const response = {
                    wallet_id: row.user_id,
                    balance: updatedBalance, // Assuming balance is a field in the users table
                    wallet_user: {
                        user_id: row.user_id,
                        user_name: row.user_name
                    }
                };
                res.status(200).json(response);
            });
        });
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad request'
        });
    }
});









const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`app is listening on http://localhost:${port}`));
