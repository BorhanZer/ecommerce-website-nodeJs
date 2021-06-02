var express = require('express');
var router = express.Router();

// Get page model
var Page = require('../modeles/page');
// express validator 
const { check, validationResult } = require('express-validator');
// express validator test
router.get("/test", [check('email', "your custom error message").isEmail()], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('errorPage', { errors: errors.array() });
        //if api caller return res.status(422).json({ errors: errors.array() });
    } else {
        //here everything is ok to proceed
        res.render('successPage', { data });
        //to api caller  res.json({msg : "ok"})
    }

});

/*
 *  Get a /
 */
router.get('/', function(req, res) {
    Page.findOne({ slug: "home" }, function(err, page) {
        if (err) {
            console.log(err);
        }
        res.render('index', {
            title: page.title,
            content: page.content
        });

    });
});

/*
 *  Get a page
 */
router.get('/:slug', function(req, res) {
    var slug = req.params.slug;
    Page.findOne({ slug: slug }, function(err, page) {
        if (err) {
            console.log(err);
        }
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });
});


// Exports
module.exports = router;