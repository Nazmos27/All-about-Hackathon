const express = require('express')
const {createItem, readItems, updateItem, deleteItem} = require('./crud')
const app = express()
const url = require('url')
const db = require('./database')


app.use(express.json())

//Get api
app.get('/items',(req,res) => {
    try {
        let sql = "SELECT * FROM items";
        const queryObject = url.parse(req.url, true).query;
        console.log(queryObject.name,queryObject.value);
        const name = queryObject.name; // Extracting the query parameter name
        const value = queryObject.value; // Extracting the query parameter value
        if(name  && value){ 
            sql += ` WHERE ${name} LIKE ?`; // Using parameterized query to prevent SQL injection
            db.all(sql, [`%${value}%`], (err, rows) => {
                if(err){
                    // console.error("erro : ", err)
                    return res.status(400).send(err.message);
                }
                if(rows.length < 1){
                    return res.status(400).send("No such  item found!");
                }
                return res.status(200).json({
                    status: 200,
                    data: rows,
                })
            })
        }else{
            readItems((err,rows) =>{
                if(err){
                    return res.status(500).send(err.message)
                }else{
                    res.status(200).json(rows)
                }
            })
        }
    } catch (error) {
        // console.error("Error handling request:", error);
        return res.status(400).json({
            status: 400,
            success: false,
            error: 'Bad Request',
        });
    }
})



//post api
app.post('/items',(req,res) => {
    const {name, description} = req.body;
    createItem(name,description,(err,data) =>{
        if (err) {
            res.status(400).send(err.message);
        }else{
            res.status(200).send(`item is added id : ${data.id}`);
        }
    })
})

//update api
app.put('/items/:id',(req,res) =>{
    const {name,description} = req.body;
    updateItem(req.params.id,name,description,(err) => {
        if(err){
            res.status(500).send(err.message)
        }else{
            res.status(200).send("The item has been updated")
        }
    })
})

//delete api
app.delete('/items/:id',(req,res) =>{
    deleteItem(req.params.id,(err) =>{
        if(err){
            res.status(500).send(err.message)
        }else{
            res.status(200).send('the item has been deleted')
        }
    })
})

app.listen(3000, ()=> console.log("Server started on port 3000"))