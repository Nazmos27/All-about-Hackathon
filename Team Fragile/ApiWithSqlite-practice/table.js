

const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./quote.db", sqlite.OPEN_READWRITE, (err)=>{
    if(err) return console.error(err);
})

const sql = `CREATE TABLE bookStore(ID INTEGER PRIMARY KEY, title TEXT, author TEXT, genre TEXT, price REAL)`;
db.run(sql);