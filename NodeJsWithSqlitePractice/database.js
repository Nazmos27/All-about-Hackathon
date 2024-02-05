const sqlite = require('sqlite3').verbose()
const dbName = 'myDatabase.db'

let db = new sqlite.Database(dbName,(err) => {
    if(err){
        console.error(err.message);
    }else{
        console.log("Created database successfully");
        db.run("CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT ,description TEXT)",(err) => {
            if(err){
                console.error(err.message)
            }else{
                console.log("table created or existed");
            }
        })
    }
})

module.exports = db;