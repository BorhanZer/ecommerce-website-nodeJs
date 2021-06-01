var express = require('express');
var router = express.Router();
const { body, check, validationResult } = require('express-validator');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var path = require('path');
// upload a file with multer 
//var multer = require('multer')
//var upload = multer({ dest: 'public/' });

// Get product, category model
var Product = require('../modeles/product');
var Category = require('../modeles/category');



/*
 *   Get products index 
 */
router.get('/', function(req, res) {
    var count;
    Product.countDocuments(function(err, c) {
        count = c;
    });
    Product.find(function(err, products) {
        res.render("admin/products", {
            products: products,
            count: count
        });
    });
});

/*
 *   Get add product
 */
router.get('/add-product', function(req, res) {
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function(err, categories) {
        res.render('admin/add-product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });

});

/*
 *   Get edit product 
 */
router.get('/edit-product/:id', function(req, res) {
    var errors;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    Category.find(function(err, categories) {
        Product.findById(req.params.id, function(err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product-images/' + p._id + '/gallery';
                var galleryImages = null;
                fs.readdir(galleryDir, function(err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
                        res.render('admin/edit-product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});



/*
 *   POST add products 
 */
router.post('/add-product', async function(req, res) {
    if (req.files) {
        var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    } else {
        var imageFile = "";
    }
    var ext = (path.extname(imageFile)).toLowerCase();
    var resultat = "";
    if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
        resultat = ext;
    } else {
        resultat = "";
    }
    await check('title', 'Title must have a value.').notEmpty().run(req);
    await check('desc', 'Description must have a value.').notEmpty().run(req);
    await check('price', 'Price must have a value.').isDecimal().run(req);
    await check(resultat, 'you must upload an image.').isEmpty().run(req);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Product.findOne({ slug: slug }, function(err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another');
                Category.find(function(err, categories) {
                    res.render('admin/add-product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function(err) {
                    if (err) {
                        return console.log("save" + err);
                    }
                });

                async function createFolder() {
                    await mkdirp('public/product-images/' + product._id)
                        .then(made =>
                            console.log(`made directories, starting with ${made}`));
                    await mkdirp('public/product-images/' + product._id + '/gallery')
                        .then(made =>
                            console.log(`made directories, starting with ${made}`));;
                    await mkdirp('public/product-images/' + product._id + '/gallery/thumbs')
                        .then(made =>
                            console.log(`made directories, starting with ${made}`));;


                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var pathImg = 'public/product-images/' + product._id + '/' + imageFile;

                        productImage.mv(pathImg, (err) => {
                            console.log("mv" + err);
                        });
                    }
                };
                createFolder();
                req.flash('success', 'Product added');
                res.redirect('/admin/products')

            }
        });
    } else {
        var errors = validationResults.array({ onlyFirstError: true });
        Category.find(function(err, categories) {
            res.render('admin/add-product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    }



});

/*
 *   POST edit product 
 */
router.post('/edit-product/:id', async function(req, res) {
    if (req.files) {
        var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    } else {
        var imageFile = "";
    }
    var ext = (path.extname(imageFile)).toLowerCase();
    var resultat = "";
    if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
        resultat = ext;
    } else {
        resultat = "";
    }
    await check('title', 'Title must have a value.').notEmpty().run(req);
    await check('desc', 'Description must have a value.').notEmpty().run(req);
    await check('price', 'Price must have a value.').isDecimal().run(req);
    //await check(resultat, 'you must upload an image.').isEmpty().run(req);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function(err, p) {
            if (err) {
                console.log(err);
            }
            if (p) {
                req.flash('danger', 'Product title exists choose another.');
                res.redirect('admin/product/edit-product/' + id);
            } else {
                Product.findById(id, function(err, p) {
                    if (err) {
                        console.log(err);
                    } else {
                        p.title = title;
                        p.slug = slug;
                        p.desc = desc;
                        p.price = price;
                        p.category = category;
                        if (imageFile != "") {
                            p.image = imageFile;
                        }
                        p.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (imageFile != "") {
                                    if (pimage != "") {
                                        fs.remove('public/product-images/' + id + '/' + pimage, function(err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    }
                                    var productImage = req.files.image;
                                    var pathImg = 'public/product-images/' + id + '/' + imageFile;

                                    productImage.mv(pathImg, (err) => {
                                        console.log("mv" + err);
                                    });
                                }
                                req.flash('success', 'Product edited');
                                res.redirect('/admin/products/edit-product/' + id);

                            }
                        });
                    }
                });
            }
        });

    } else {
        var errors = validationResults.array({ onlyFirstError: true });
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    }
});

/*
 *   Post upload gallery 
 */
router.post('/product-gallery/:id', function(req, res) {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product-images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product-images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err) {
        if (err) {
            console.log(err);
        }
        resizeImg(fs.readFileSync(path), {
            width: 100,
            heigth: 100
        }).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });
    res.sendStatus(200);
});


/*
 *   Get delete gallery image
 */
router.get('/delete-image/:image', function(req, res) {
    var path = 'public/product-images/' + req.query.id + '/gallery/' + req.params.image;
    var pathThumbs = 'public/product-images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(path, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(pathThumbs, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/*
 *   Get delete product 
 */
router.get('/delete-product/:id', function(req, res) {
    var id = req.params.id;
    var pathFolder = 'public/product-images/' + id;
    fs.remove(pathFolder, function(err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndDelete(req.params.id, function(err) {
                if (err) {
                    return console.log(err);
                } else {
                    req.flash('success', 'product deleted !');
                    res.redirect('/admin/products/');
                }
            });

        }
    });

});

// Exports
module.exports = router;