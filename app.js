const express = require('express');
const app = express();
const mongoose = require('mongoose');
// const Product = require('./model/product')
const morgan = require('morgan');
require('dotenv/config');
const api = process.env.API_URL;
const databasem = process.env.CONNECTION_STRING;
 const PORT = process.env.PORT || 3000;
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');



app.use(cors());
app.options('*', cors());
//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);


//Router
const categoriesRoutes = require('./routers/categories');
const productRouter = require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');



app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);



//DatabaseConnection
mongoose.connect(databasem)
    .then(() => {
        console.log('ready database');
    })
    .catch((err) => {
        console.log(err);

    })

    
//Server
app.listen(PORT, (req,res)=>{
    console.log('http://localhost:3000')
})