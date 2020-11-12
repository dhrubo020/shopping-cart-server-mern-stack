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
    const user_collection = client.db("db_zoynax").collection("coll_user");
    const admin_collection = client.db("db_zoynax").collection("coll_admin");
    const order_collection = client.db("db_zoynax").collection("coll_order");
    console.log("db connected")


    //------------------ product ------------------------------------------------------------------------

    app.post('/addProduct', (req, res) => { // -----------add product
        // console.log(req.body.price);
        product_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/getAllProduct', (req, res) => { // ----------- get all product
        product_collection.find({ active: true })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/findCarts', (req, res) => { // --------- find cart-products from product
        const listOfIds = (req.body)
        const documentIds = listOfIds.map(function (myId) { return ObjectId(myId); });
        product_collection.find({ _id: { $in: documentIds } })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //---------------------- Promo Code api -------------------------------------------------------


    app.post('/addPromoCode', (req, res) => { // ----------- add promo code
        // console.log(req.body);
        promo_code_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/getAllPromo', (req, res) => { // ----------- get all promo codes
        promo_code_collection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    app.get('/getPromoById/:id', (req, res) => { // ----------- get a promo code by id
        // const id = req.params.id;
        promo_code_collection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })
    app.patch('/updatePromoCode', (req, res) => { //---------------- update promo code
        // console.log(req.body)
        promo_code_collection.updateOne(
            { _id: ObjectId(req.body.id) },
            {
                $set: req.body.codeInfo,
                $currentDate: { "lastModified": true }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    

    //--------------------------------- orders ---------------------------------------------------

    app.post('/placeOrder', (req, res) => { // ----------- place a order from user
        // console.log(req.body);
        order_collection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/getAllOrder', (req, res) => { // ----------- get all orders for admin
        order_collection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.patch('/updateOrderStatus', (req, res) => { //------ update order Status
        // console.log(req.body)
        order_collection.updateOne(
            { _id: ObjectId(req.body.id) },
            {
                $set: req.body.newOrderInfo,
                $currentDate: { "lastModified": true }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    //------------------------- user api ----------------------------------------------------------

    app.post('/user', (req, res) => { // ----------- get user data or add new user
        // console.log(req.body.phone);
        user_collection.find({ phone: req.body.phone })
            .toArray((err, documents) => {
                if (err) {
                    console.log('user err');
                }
                if (documents.length > 0) {
                    res.send(documents[0])
                } else {
                    user_collection.insertOne(req.body)
                        .then(result => {
                            res.send(result.insertedCount > 0)
                        })
                }
            })
    })
    //------------------------- admin auth api ----------------------------------------------------------

    app.post('/admin', (req, res) => { // ----------- admin auth
        // console.log(req.body.phone);
        admin_collection.find({ phone: req.body.phone, password: req.body.password })
            .toArray((err, documents) => {
                if (documents.length > 0) {
                    res.send(true)
                } else {
                    res.send(false)
                }
            })
    })


});



app.get('/', (req, res) => {
    res.send('Zoynax Backend Server!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Listening at http://localhost:${port}`)
})