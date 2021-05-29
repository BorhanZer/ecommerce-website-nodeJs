var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');

router.get('/', function(req, res) {
    res.render('index');
});

// express validator 
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
// Exports
module.exports = router;