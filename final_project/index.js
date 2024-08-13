const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"verysecret",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['token'];
    
        jwt.verify(token, "verysecret", (err, user) => {
            if (err) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: "User not logged in" });
    }
    });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));