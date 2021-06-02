var express = require('express');
const { update } = require('../modeles/product');
var router = express.Router();

// Get page model
var Product = require('../modeles/product');

/*
 *  Get add product to cart
 */
router.get('/add/:product', function(req, res) {
    var slug = req.params.product;
    Product.findOne({ slug: slug }, function(err, p) {
        if (err) {
            console.log(err);
        }
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product-images/' + p._id + '/' + p.image,
            });
        } else {
            var cart = req.session.cart;
            var nawItem = true;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    nawItem = false;
                    break;
                }
            }
            if (nawItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product-images/' + p._id + '/' + p.image,
                });
            }
        }
        console.log(req.session.cart);
        req.flash('success', 'product added');
        res.redirect('back');
    });
});

/*
 *  Get checkout
 */
router.get('/checkout', function(req, res) {
    res.render('checkout', {
        title: 'checkout',
        cart: req.session.cart
    })
});

/*
 *  Get get update product
 */
router.get('/update/:product', function(req, res) {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty == 0) {
                        cart.splice(i, 1);
                        if (cart.length == 0) {
                            delete req.session.cart;
                        }
                    }
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) {
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('update problem')
                    break;
            }
            break;
        }
    }
    req.flash('success', 'cart updated');
    res.redirect('/cart/checkout');
});
/*
 *  Get clear cart
 */
router.get('/clear', function(req, res) {
    if (typeof req.session.cart != "undefined") {
        delete req.session.cart;
    }
    req.flash('success', 'cart cleared');
    res.redirect('/cart/checkout');
});
/*
 *  Get buynow
 */
router.get('/buynow', function(req, res) {
    if (typeof req.session.cart != "undefined") {
        delete req.session.cart;
    }
    res.sendStatus(200);
});
// Exports
module.exports = router;