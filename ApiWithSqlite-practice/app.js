const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const sqlite = require('sqlite3').verbose()
let sql;
const db = new sqlite.Database('./quote.db',sqlite.OPEN_READWRITE, (err) => {
    if(err){
        return console.error(err)
    }
})


app.use(bodyParser.json())

//post method

// app.post('/quote',(req,res) => {
//     try {
//         const {movie, quote,  character} = req.body;
//         sql = "INSERT INTO quote(movie,quote,character) VALUES(?,?,?)"
//         db.run(sql,[movie,quote,character],(err) => {
//             if(err) 
//                 return (res.json({
//                     status : 300,
//                     success: false,
//                     error : err
//                 }))
            
//             console.log("successful input ",movie,quote,character);
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

app.listen(3000)


