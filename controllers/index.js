var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config');

router.get('/', function(req, res) {
    console.log('get');
    var url = 'FB';
    getStocks(url).then(function(response, error) {
        res.render('index', {
            response: response
        });
    }).catch(function(error) {
        console.log(error)
    });
})


router.post('/', function(req, res) {

})

function getStocks(stockCode) {
    var apiKey = config.getQuandlAPIKey();
    var requestURL = `https://www.quandl.com/api/v3/datasets/WIKI/${stockCode}.json?column_index=4&start_date=2014-01-01&end_date=2014-12-31&collapse=daily&transform=diff&api_key=${apiKey}`
    return new Promise(function(resolve, reject) {
        request(requestURL, function(err, res, body) {
            console.log(res.statusCode);
            if (err) {
                reject(err);
            } else if (!err && res.statusCode == 200) {
                var info = JSON.parse(body)
                resolve(info);
            }
        })
    });
}


module.exports = router;
