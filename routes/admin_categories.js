var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get category model
var Category = require('../modeles/category');




/*
 *   Get categories index 
 */
router.get('/', isAdmin, function(req, res) {
    Category.find(function(err, categories) {
        if (err) {
            return console.log(err);
        }
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
 *   Get add category 
 */
router.get('/add-category', isAdmin, function(req, res) {
    var title = "";

    res.render('admin/add-category', {
        title: title
    });
});


/*
 *   Post add category 
 */
router.post('/add-category', isAdmin, async function(req, res) {
    await check('title', 'Title must have a value.').notEmpty().run(req);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Category.findOne({ slug: slug }, function(err, category) {
            if (category) {
                req.flash('danger', 'Category slug exists, choose another');
                res.render('admin/add-category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });
                Category.save(function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    Category.find({}).exec(function(err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            app.locals.categories = categories;
                        }
                    });
                    req.flash('success', 'Category added');
                    res.redirect('/admin/categories')
                })
            }
        })
    } else {
        var errors = validationResults.array();
        res.render('admin/add-category', {
            errors: errors,
            title: title,
        });
    }



});

/*
 *   Get edit categories 
 */
router.get('/edit-category/:id', isAdmin, function(req, res) {
    Category.findById(req.params.id, function(err, category) {
        if (err)
            return console.log("borhan " + err);

        res.render('admin/edit-category', {
            title: category.title,
            id: category._id
        });
    });



});

/*
 *   POST edit category 
 */
router.post('/edit-category/:id', isAdmin, async function(req, res) {
    await check('title', 'Title must have a value.').notEmpty().run(req);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.body.id;

    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function(err, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another');
                res.render('admin/edit-category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function(err, category) {
                    if (err) { return console.log(err); }
                    category.title = title;
                    category.slug = slug;

                    category.save(function(err) {
                        if (err) {
                            return console.log(err);
                        }

                        Category.find({}).exec(function(err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                app.locals.categories = categories;
                            }
                        });
                        req.flash('success', 'Category edited');
                        res.redirect('/admin/categories/edit-category/' + category.id)
                    })
                });
            }
        })
    } else {
        var errors = validationResults.array();
        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            id: id
        });
    }



});


/*
 *   Get delete category 
 */
router.get('/delete-category/:id', isAdmin, function(req, res) {
    Category.findByIdAndDelete(req.params.id, function(err) {
        if (err) {
            return console.log(err);
        }
        Category.find({}).exec(function(err, categories) {
            if (err) {
                console.log(err);
            } else {
                app.locals.categories = categories;
            }
        });
        req.flash('success', 'Category deleted !');
        res.redirect('/admin/categories/');
    });
});

// Exports
module.exports = router;