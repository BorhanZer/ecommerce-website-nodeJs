var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');

//Connect to db 
mongoose.connect(config.datbase, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to mongodb');
})

// init app


var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//set global errors variable
app.locals.errors = null;

//set pages Model
var Page = require('./modeles/page');
//Get Pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});
// Express fileUpload midelware
app.use(fileUpload());

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


// active url 
app.use(function(req, res, next) {
    res.active = req.path.split('/')[1]
    next();
});
// set routes

var pages = require('./routes/pages');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/', pages);

//start the server 
var port = 3000;
app.listen(port, function() {
    console.log('server started  on port ' + port);
});
//so the program will not close instantly
// stop using the port *3000*  kill the process exit the program  
//  tell Node.js to always do something just before it exits, for whatever reason — Ctrl+C, an exception, or any other reason.
process.stdin.resume();

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}
//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));