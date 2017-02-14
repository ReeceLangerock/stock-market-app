// SETUP
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;

// EXPRESS SETUP

app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.use(function(err, req,res, next){
  res.sendStatus(404);
  res.render('404');
  return;
});


// SOCKET SETUP

// ROUTES
app.use('/', require('./controllers/index'));

// LAUNCH
  app.listen(port, function(){
    console.log('connected');
  });
