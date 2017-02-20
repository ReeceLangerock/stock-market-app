var express = require('express');
var router = express.Router();

var returnRouter = function(io) {
    // setup router
    var request = require('request');
    var bodyParser = require('body-parser');
    //var config = require('../config');
    var stockModel = require('../models/stocks.js')

    router.use(bodyParser.urlencoded({
        extended: true
    }));
    router.use(bodyParser.json());

    // initialize io socket
    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
        console.log('user disconnected');
        });
    });

    router.get('/', function(req, res) {

        var promiseArray = [];
        // query mongodb for saved stock codes
        queryAllSavedStocks().then(function(response, error) {
            // render with empty data if no saved codes
            if (response.length == 0) {
                res.render('index', {
                    dataset: '',
                    labels: '',
                    stockDescription: ''
                });
            }
            // get the stockcodes saved in mongodb
            var stockCodes = [];
            for (let i = 0; i < response.length; i++) {
                stockCodes.push(response[i].stockCode);
            }
            return stockCodes;

        }).then(function(response, error) {
            // get current date and format for url request
            var date = new Date();
            var startDate = (date.getFullYear() - 1) + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            var endDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate();

            // get data for each stock saved in mongodb
            for (let i = 0; i < response.length; i++) {
                promiseArray.push(getStock(response[i], startDate, endDate));
            }

        }).then(function(response, error) {
            Promise.all(promiseArray).then(function(response, error) {
                //format response info for each stockcode and push into dataset
                var labels = [];
                var dataset = [];
                var description = [];
                for (let i = response[0].dataset.data.length - 1; i > 0; i--) {
                    labels.push(response[0].dataset.data[i][0])
                }
                for (let stockNum = 0; stockNum < response.length; stockNum++) {
                    var tempData = [];
                    for (let i = 0; i < response[stockNum].dataset.data.length; i++) {
                        tempData.push(response[stockNum].dataset.data[i][1]);
                    }
                    dataset.push({
                        fill: false,
                        borderColor: generateRandomColor(),
                        pointRadius: 0,
                        pointHitRadius: 50,
                        label: response[stockNum].dataset.dataset_code,
                        data: tempData
                    });
                    description.push(response[stockNum].dataset.name)
                }

                //render home page with data from stocks
                res.render('index', {
                    dataset: dataset,
                    labels: labels,
                    stockDescription: description
                });

            })
        });

    })


    router.post('/addStockCode', function(req, res) {
        //first check if stock is already in mongodb
        querySubmittedStock(req.body.stockCode).then(function(response, error) {
            //if stock found, send 404 and emit
            if (response == 'FOUND') {

                res.send('duplicate stock');
                res.end();
            } else {
                var date = new Date();
                var startDate = date.getFullYear() - 1 + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                var endDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                getStock(req.body.stockCode, startDate, endDate).then(function(response, error) {
                    if (response == '404') {
                        res.send('wrong stock');
                        res.end();
                    } else {
                        stockModel.schema.methods.newStock(response.dataset.id, response.dataset.dataset_code);
                        io.sockets.emit('add stock', response);
                        res.send('200');
                        res.end();
                    }
                })
            }
        }).catch(function(error) {
            console.log(error)
        });
    })

    router.post('/removeStockCode', function(req, res) {

        removeStock(req.body.stockCode).then(function(response, error) {
            if (response == '404') {
                res.send('404');
                res.end();
            } else {

                io.sockets.emit('remove stock', req.body.stockCode);
                res.send('200');
                res.end();
            }
        });
    })

    function queryAllSavedStocks() {

        return new Promise(function(resolve, reject) {
            stockModel.find(
                function(err, docs) {
                    if (err) {
                        throw err
                    } else {
                        resolve(docs);
                    }

                })
        });
    }

    function generateRandomColor() {
        var letters = '0123456789ABCDEF';
        var hex = '#';
        for (var i = 0; i < 6; i++) {
            hex += letters[Math.floor(Math.random() * 16)];
        }
        return hex;
    }

    function querySubmittedStock(code) {
        code = code.toUpperCase();
        return new Promise(function(resolve, reject) {
            stockModel.findOne({
                    'stockCode': code
                },
                function(err, docs) {
                    if (err) {
                        console.log('error');
                        reject(err);
                    } else if (docs) {
                        resolve('FOUND')
                    } else {
                        resolve('NOT_FOUND');
                    }
                });
        });

    }

    function getStock(stockCode, startDate, endDate) {
        var apiKey = process.env.QUANDL_API_KEY;// || config.getQuandlAPIKey();
        var requestURL = `https://www.quandl.com/api/v3/datasets/WIKI/${stockCode}.json?column_index=4&start_date=${startDate}&end_date=${endDate}&collapse=daily&api_key=${apiKey}`
        return new Promise(function(resolve, reject) {
            request(requestURL, function(err, res, body) {
                console.log(res.statusCode);
                if (err) {
                    console.log(err);
                    reject(err);
                } else if (!err && res.statusCode == 200) {
                    var info = JSON.parse(body)
                    resolve(info);
                } else if (res.statusCode == 404) {
                    resolve('404');
                } else if (res.statusCode == 400) {
                    resolve('400');
                }

            })
        });
    }

    function removeStock(stockCode) {
        console.log('in remove\nstockcode:');
        console.log(stockCode);
        return new Promise(function(resolve, reject) {
            stockModel.findOneAndRemove({
                    'stockCode': stockCode
                },
                function(err, docs) {
                    console.log('in func:');
                    if (err) {
                        console.log('error');
                        reject(err);
                    } else if (docs) {
                        console.log('REMOVED');
                        resolve('REMOVED')
                    } else {
                        console.log('NOT REMOVED');
                        resolve('NOT_REMOVED');
                    }
                });
        });
    }
    return router;
}

module.exports = returnRouter;
