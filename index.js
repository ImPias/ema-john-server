const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbmds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollection = client.db("emaJohnStore").collection("products");
    const ordersCollection = client.db("emaJohnStore").collection("orders");
  
    app.post('/addProduct', (req, res) => {
        const product = req.body;
        productsCollection.insertOne(product)
        .then(result => {
            res.send(result.insertedCount);
        })
    })

    app.get('/products', (req, res) => {
        const searchQuery = req.query.searchQuery;
        console.log(searchQuery);
        productsCollection.find({name: {$regex: searchQuery}})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get('/product/:key', (req, res) => {
        productsCollection.find({key: req.params.key})
        .toArray((err, documents) => {
            res.send(documents[0]);
        })
    })

    app.post('/productsbykeys', (req, res) => {
        const productkeys = req.body;
        productsCollection.find({key: {$in: productkeys}})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

});

app.get('/', (req, res) => {
    res.send("Hello Ema John")
})

app.listen(process.env.PORT || port)