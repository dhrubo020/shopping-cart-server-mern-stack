const express = require('express')
const app = express()
const port = 3001

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors')
app.use(cors())

require('dotenv').config()

const ObjectId = require('mongodb').ObjectId;


const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.fxpfd.mongodb.net:27017,cluster0-shard-00-01.fxpfd.mongodb.net:27017,cluster0-shard-00-02.fxpfd.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-we805n-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const product_collection = client.db("db_zoynax").collection("coll_products");
    const promo_code_collection = client.db("db_zoynax").collection("coll_promo_code");
    
    console.log("db connected")

    
    //------------------ product_collection

    app.post('/addProduct', (req,res)=>{
        // console.log(req.body.price);
        product_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/getAllProduct', (req,res)=>{
        product_collection.find({active: true})
            .toArray((err, documents) => {
                    res.send(documents)
            })
    })

    app.post('/findCarts' , (req,res)=>{
        const listOfIds = (req.body)
        const documentIds = listOfIds.map(function(myId) { return ObjectId(myId); });
        product_collection.find({_id: {$in: documentIds }})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })
    
    //----------------------
    app.post('/addPromoCode', (req,res)=>{
        // console.log(req.body);
        promo_code_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/getAllPromo', (req,res)=>{
        promo_code_collection.find({})
            .toArray((err, documents) => {
                    res.send(documents)
            })
    })
    app.get('/getPromoById/:id', (req,res)=>{
        // const id = req.params.id;
        promo_code_collection.find({_id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                    res.send(documents[0])
            })
    })
    app.patch('/updatePromoCode', (req,res)=>{ //---------------- update Status
        // console.log(req.body)
        promo_code_collection.updateOne(
            {_id : ObjectId(req.body.id)},
            {
                $set: req.body.codeInfo,
                $currentDate : { "lastModified": true }
            }
        )
        .then(result =>{
            res.send(result.modifiedCount > 0)
        })
    })

    //-----------------------------------------

    

});



app.get('/', (req, res) => {
    res.send('Zoynax Backend Server!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Listening at http://localhost:${port}`)
})