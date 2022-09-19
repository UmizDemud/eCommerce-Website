
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var mysql = require('mysql')
const jwt = require('jsonwebtoken')

var app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(session({
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true     //You have to define the genuuid function somewhere. The express-session readme is assuming you have already implemented that.
}));


app.listen(8080);

const isProductInCart = (cart, id) => {
    for(let i = 0; i< cart.length; i++) {
        if (cart[i].id === id) {
            return true;
        }
    }

    return false;
}

const calculateTotal = (cart, req) => {
    total = 0;

    for (let i = 0; i< cart.length; i++) {
        if (cart[i].sale_price) {
            total += cart[i].sale_price * cart[i].quantity;
        } else {
            total += cart[i].price * cart[i].quantity
        }
    }

    req.session.total = total;

    return total;
}

app.get('/',function(req, res){

    var con = mysql.createConnection({
        host: "localhost",
        user: 'root',
        password: "",
        database: 'node_project'
    })
    con.query("select * from products", (err, result) => {
        res.json({result: result})
    });
    con.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });
    
})

//add_to_chart
//edit_product_quantity
//remove_product_from_cart

app.post('/payment', (req, res) => {

    //  Paypal: with a business paypal account developer.paypal.com
    //  Paytr.com


    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var city = req.body.city;
    var address = req.body.address;
    var cost = req.session.total;
    var status = "not paid";
    var date = new Date();

    var products_ids = "";
    var cart = req.session.cart;
    for (let i = 0; i < cart.length; i++) {
        products_ids += cart[i].id + "x" + cart[i].quantity
        if(i !== cart.length-1) {
            products_ids += ", "
        }
    }

    var con = mysql.createConnection({
        host: "localhost",
        user: 'root',
        password: "",
        database: 'node_project'
    })
    con.connect((err) => {
        if(err) {
            console.log(err)
        } else {
            var querry = 'insert into orders(cost, name, email, status, city, address, phone, date, products_ids) values ?'
            var values = [cost, name, email, status, city, address, phone, date, products_ids]

            con.querry(querry, [values], (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    res.sendStatus(200);
                }
            })
        }
    })

    con.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });
})

