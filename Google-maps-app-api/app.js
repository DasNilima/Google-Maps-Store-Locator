const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const Store = require('./api/models/store');
const GoogleMapsService = require('./api/services/googleMapsService');
const googleMapsService = new GoogleMapsService();
require('dotenv').config();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    next();
})
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.json({limit: '50mb'}));

app.post('/api/stores', (req, res) => {
    // console.log(req);
    // res.send("you have posted");
    // let dbStores = req.body;
    const stores = req.body;
    let dbStores = [];
    stores.forEach((store) => {
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatusText: store.openStatusText,
            addressLines: store.addressLines,
            location: {
                type: 'Point',
                coordinates: [
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]
            }
        })
    })
    Store.create(dbStores).then(()=>{
        res.send(stores);
    }).catch((err)=>{
        console.log(err);
    })
// console.log(dbStores);
// res.send("you have posted");
})

app.get('/api/stores', (req, res) => {
    const zipCode = req.query.zip_code;
    googleMapsService.getCoordinates(zipCode)
        .then((coordinates) => {
            Store.find({
                location: {
                    $near: {
                        $maxDistance: 3218,
                        $geometry: {
                            type: "Point",
                            coordinates: coordinates
                        }
                    }
                }
            }).then((stores) => {
                res.status(200).send(stores);
            }).catch((error) => {
                console.log(error);
            })
    })
})
    app.delete('/api/stores', (req, res) => {
        Store.deleteMany({}).then((result) => {
            res.status(200).send(result);
        })
    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
