var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var session = require('express-session');
//Connect to db 
mongoose.connect(config.datbase, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
        console.log('Connected to mongodb');
    })
    // test commit
    // init app


var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//set global errors variable

app.locals.errors = null;

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

// express messages 
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});



// set routes

var pages = require('./routes/pages');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/', pages);

//start the server 
var port = 3000;
app.listen(port, function() {
    console.log('server started  on port ' + port);
})