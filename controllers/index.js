var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res){

  var url = 'https://www.quandl.com/api/v3/datasets/OPEC/ORB.json?api_key=WMegHUsnhh8okQvZqftE';
  request(url, function(err, response, body){
    
    if (!err && response.statusCode == 200) {
      console.log(body);
      var info = JSON.parse(body)
        res.send(info);
    }
  })
})

function getStocks(){
  var url = 'https://www.quandl.com/api/v3/datasets/OPEC/ORB.json?api_key=WMegHUsnhh8okQvZqftE';
  request(url, function(err, res, body){
    if (!err && res.statusCode == 200) {
      var info = JSON.parse(body)
      return info;
    }
  })


}


module.exports = router;
