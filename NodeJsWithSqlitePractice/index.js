const express = require('express')
const {createItem, readItems, updateItem, deleteItem} = require('./crud')
const app = express()

app.use(express.json())

//Get api
app.get('/items',(req,res) => {
    readItems((err,rows) => {
        if(err){
            res.status(500).send(err.message)
        }else{
            res.status(200).json(rows)
        }
    })
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