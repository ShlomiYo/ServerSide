

var port = process.env.PORT || 8080;
var dbFuncs = require('./dbFuncs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});




app.post('/login', dbFuncs.LogMeIN, function(req, res){ 
});


app.post('/reg', dbFuncs.RegMe, function(req, res){ 
});




app.post('/home', dbFuncs.LiveUpdate, function(req, res){ 
});

app.post('/apartUpdate', dbFuncs.apartUpdate, function(req, res){ 
});



app.post('/addUser', dbFuncs.addUser, function(req, res){ 
});



app.post('/joinApart', dbFuncs.joinApart, function(req, res){ 
});

app.post('/createNewApart', dbFuncs.createNewApart, function(req, res){ 
});



app.post('/settingsKickStart', dbFuncs.settingsKickStart, function(req, res){ 
});


app.post('/simpleUpdate', dbFuncs.simpleUpdate, function(req, res){ 
});


app.post('/adminUpdate', dbFuncs.adminUpdate, function(req, res){ 
});


app.post('/removeUser', dbFuncs.removeUser, function(req, res){ 
});



app.post('/leaveApartment', dbFuncs.leaveApartment, function(req, res){ 
});












app.listen(port);
console.log('Listening on port '+port);