const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose  = require('mongoose');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")

const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(cookieParser());
const multer = require("multer")


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use(multer().any())
app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});