// SETUP
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var config = require('./config');
var mongoose = require('mongoose');

//MONGOOSE CONFIG
var userName = process.env.MONGO_USERNAME || config.getMongoUser();
var password = process.env.MONGO_PASSWORD || config.getMongoPass();
mongoose.connect(`mongodb://${userName}:${password}@ds145669.mlab.com:45669/nightlife`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection eror:'));
db.once('open', function(){
  console.log("db connected");
})

// SOCKET SETUP
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// EXPRESS SETUP
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.use(function(err, req, res, next) {
    res.sendStatus(404);
    res.render('404');
    return;
});

// ROUTES
app.use('/', require('./controllers/index')(io));

// LAUNCH
server.listen(port, function(){
  console.log('server connected');
})
