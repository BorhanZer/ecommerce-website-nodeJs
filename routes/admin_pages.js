var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var Page = require('../modeles/page');




/*
 *   Get pages index 
 */
router.get('/', function(req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
 *   Get add pages 
 */
router.get('/add-page', function(req, res) {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add-page', {
        title: title,
        slug: slug,
        content: content
    });
});

/*
 *   Get edit pages 
 */
router.get('/edit-page/:id', function(req, res) {
    Page.findById(req.params.id, function(err, page) {
        if (err)
            return console.log("borhan " + err);

        res.render('admin/edit-page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });



});
// reorder function
function reorder(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function(count) {
            Page.findById(id, function(err, page) {
                page.sorting = count;
                page.save(function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    count++;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }

}
/*
 *  Post reorder-pages"
 */
router.post('/reorder-pages', function(req, res) {
    var ids = req.body['id'];

    reorder(ids, function() {
        Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


/*
 *   POST add pages 
 */
router.post('/add-page', async function(req, res) {
    await check('title', 'Title must have a value.').notEmpty().run(req);
    await check('title', 'content must have a value.').notEmpty().run(req);

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Page.findOne({ slug: slug }, function(err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/add-page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages')
                })
            }
        })
    } else {
        var errors = validationResults.array();
        res.render('admin/add-page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    }



});

/*
 *   POST edit pages 
 */
router.post('/edit-page/:id', async function(req, res) {
    await check('title', 'Title must have a value.').notEmpty().run(req);
    await check('content', 'content must have a value.').notEmpty().run(req);

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    var id = req.params.id;
    const validationResults = validationResult(req);
    if (validationResults.isEmpty()) {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function(err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/edit-page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function(err, page) {
                    if (err) { return console.log(err); }
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.id = id;

                    page.save(function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });
                        req.flash('success', 'Page edited');
                        res.redirect('/admin/pages/edit-page/' + page.id)
                    })
                });
            }
        })
    } else {
        var errors = validationResults.array();
        res.render('admin/edit-page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    }



});

/*
 *   Get delete page 
 */
router.get('/delete-page/:id', function(req, res) {
    Page.findByIdAndDelete(req.params.id, function(err) {
        if (err) {
            return console.log(err);
        }
        Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        req.flash('success', 'Page deleted !');
        res.redirect('/admin/pages/');
    });
});

// Exports
module.exports = router;