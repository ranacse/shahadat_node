const mysql = require('mysql');
const express = require('express');
//const debug = require('debug');

var app = express();
const bodyparser = require('body-parser');
//var routes = require('./routes/index');
//var users= require('./routes/users');

app.use(bodyparser.json());
// app.use('/', routes);
// app.use('/users', users);
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // // Pass to next layer of middleware
    next();
});

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'shahadat',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});


app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));


//Get all employees
app.get('/products', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    mysqlConnection.query('SELECT * FROM shahadatProducts', (err, rows, fields) => {
        if (!err) {

            res.send(rows);
        }

        else
            console.log(err);
    })
});

app.get('/sellProducts', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    mysqlConnection.query('SELECT * FROM productSell', (err, rows, fields) => {
        if (!err) {
            res.send(rows);

        }

        else
            console.log(err);
    })
});

//Get an employees
app.get('/products/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    mysqlConnection.query('SELECT * FROM shahadatProducts WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
            data = JSON.stringify(rows);

            asd = JSON.parse(data);
            console.log(asd[0].Quantity);
        }

        else
            console.log(err);
    })
});

//Delete an employees
app.delete('/products/:id', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.params.id != 9999) {
        //when really delete from product list
        mysqlConnection.query('DELETE FROM shahadatProducts WHERE ID = ?', [req.params.id], (err, rows, fields) => {
            if (!err)
                res.send('Deleted successfully.');
            else
                console.log(err);
        })
    }
    else {
        //when insert after sell
        mysqlConnection.query('DELETE FROM productSell', (err, rows, fields) => {
            if (!err) {
                res.send('Deleted All successfully.');

            }

            else
                console.log(err);
        })
    }
});

// 
//Insert products
app.post('/products', (req, res) => {

    let pro = req.body;
    //console.log(pro);

    res.setHeader('Access-Control-Allow-Origin', '*');

    var newProduct = { Name: pro.name, Quantity: pro.Quantity };

    mysqlConnection.query('INSERT INTO shahadatProducts SET ?', newProduct, function (error, results, fields) {
        if (error) {
            res.send(error);
        }
        else {

            res.send("Successfully Created");

        }

        // Neat!
    });

});

//Insert product for after Sell
app.post('/sellProducts', (req, res) => {

    let pro = req.body;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    res.setHeader('Access-Control-Allow-Origin', '*');

    var sellProduct = { ProductName: pro.name, Price: pro.Price, Quantity: pro.Quantity, TotalAmount: pro.totalPrice, invoiceDate: dateTime, invoiceNo:1002 };
    console.log(sellProduct);


    mysqlConnection.query('INSERT INTO productSell SET ?', sellProduct, function (error, results, fields) {
        if (error) res.send(error);
        else {
            // get present product quantity
            console.log('productSell is ok');
            res.send("Successfully Created");
            mysqlConnection.query('SELECT * FROM shahadatProducts where name = ?', [pro.name], (err, rows, fields) => {
                if (!err) {

                    res.send("Successfully Created");
                    console.log('productSell is ok');
                    
                    data = JSON.stringify(rows);

                    parseProductData = JSON.parse(data);
                    // console.log('from database   '+parseProductData[0].Quantity);


                    let latestQuantity = parseProductData[0].Quantity - pro.Quantity;
                    console.log('which will update to DB:  ' + latestQuantity);

                    // update present product quantity UPDATE shahadatproducts SET Quantity = 50 where name = "GP";
                    mysqlConnection.query('UPDATE shahadatproducts SET Quantity = ? where name = ?', [latestQuantity, pro.name], (err, rows, fields) => {
                        if (!err) {

                        }
                        else {
                            console.log('error is ' + err);
                        }

                    })
                }

                else
                    console.log(err);
            })
            //start calcuate reamin product quantity after sell
            res.send("Successfully Sold Products");


        }
    });

});



//Update an products

app.put('/products', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    let emp = req.body;
    res.send(emp);

    console.log('COme to ba kEnd for Update.');

    console.log('Id =  ' + emp.id);
    console.log('Quantity =  ' + emp.Quantity);
    console.log('Name =  ' + emp.name);

    mysqlConnection.query('UPDATE shahadatproducts SET Quantity = ? where name = ?', [emp.Quantity, emp.name], (err, rows, fields) => {
        if (!err) {

        }
        else {
            console.log('error is ' + err);
        }

    })
});

//update product quantity
app.put('/updateQuntity', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    let emp = req.body;
    res.send(emp);
    console.log(emp);
    console.log('DB connection succeded again.');

    mysqlConnection.query('UPDATE shahadatproducts SET Quantity = ? where name = ?', [emp.Quantity, emp.name], (err, rows, fields) => {

        if (!err) {
            res.send('Updated successfully');
            console.log('Updated successfully');
        }
        else {
            console.log(err);
        }

    })
});



