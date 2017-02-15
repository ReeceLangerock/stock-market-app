var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');
var config = require('../config');

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.get('/', function(req, res) {
    var url = 'FB';
    getStocks(url).then(function(response, error) {
        res.render('index', {
            data: response
        });
    }).catch(function(error) {
        console.log(error)
    });
})


router.post('/addStockCode', function(req, res) {
    getStocks(req.body.stockCode).then(function(response, error) {
        
        if (response == '404') {
            res.send('404');
        } else {
            res.send(response.dataset.data);
        }

    }).catch(function(error) {
        console.log(error)
    });


})



function getStocks(stockCode) {
    var apiKey = config.getQuandlAPIKey();
    var requestURL = `https://www.quandl.com/api/v3/datasets/WIKI/${stockCode}.json?column_index=4&start_date=2014-01-01&end_date=2014-12-31&collapse=daily&api_key=${apiKey}`

    return new Promise(function(resolve, reject) {
        request(requestURL, function(err, res, body) {
            console.log(res.statusCode);

            if (err) {
                reject(err);
            } else if (!err && res.statusCode == 200) {
                var info = JSON.parse(body)
                resolve(info);
            } else if (res.statusCode == 404) {
                reject('404');
            }
        })
    });
}


module.exports = router;
