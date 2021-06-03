var express = require('express');
const category = require('../modeles/category');
var router = express.Router();
var fs = require('fs-extra');

// Get Product model
var Product = require('../modeles/product');
// Get category model
var Category = require('../modeles/category');


/*
 *  Get all products
 */
router.get('/', function(req, res) {
    var loggedin = (req.isAuthenticated()) ? true : false;
    Product.find(function(err, products) {
        if (err) {
            console.log(err);
        }
        res.render('all-products', {
            title: "All products",
            loggedin: loggedin,
            products: products
        });

    });
});

/*
 *  Get  products by category
 */
router.get('/:category', function(req, res) {
    var categorySlug = req.params.category;
    var loggedin = (req.isAuthenticated()) ? true : false;
    Category.findOne({ slug: categorySlug }, function(err, c) {
        Product.find({ category: categorySlug }, function(err, products) {
            if (err) {
                console.log(err);
            }
            res.render('cat-products', {
                title: c.title,
                products: products,
                loggedin: loggedin

            });

        });
    });

});

/*
 *  Get product details
 */
router.get('/:category/:product', function(req, res) {
    var loggedin = (req.isAuthenticated()) ? true : false;
    var galleryImage = null;
    Product.findOne({ slug: req.params.product }, function(err, product) {
        if (err) {
            console.log(err);
        } else {
            galleryImage = 'public/product-images/' + product._id + '/gallery';

            fs.readdir(galleryImage, function(err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImage = files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImage: galleryImage,
                        loggedin: loggedin
                    })
                }
            });
        }
    });
});

// Exports
module.exports = router;