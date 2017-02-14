// SETUP
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;

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


// SOCKET SETUP
  io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
  });

// ROUTES
app.use('/', require('./controllers/index'));

// LAUNCH
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
server.listen(port, function(){
  console.log('connected');
})
