const Product = require('../models/product')
const User = require('../models/user')
const News = require('../models/news')
const path = require('path')
const { validationResult } = require('express-validator')

exports.getAddNews = (req, res, next) => {
    res.render('shop/pages/add-news', {
        pageTitle: 'Add News',
        path: '/add-news',
        editMode: false
    })
}

exports.postAddNews = (req, res, next) => {
    const { title, imageUrl, date, description } = req.body

    const article = new News({
        title,
        imageUrl,
        date,
        description,
        userId: req.user._id
    })

    article
        .save()
        .then(() => {
            res.redirect('/add-news')
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getEditNews = (req, res, next) => {
    const articleId = req.params.articleId

    News.findById({ _id: articleId, userId: req.user._id })
        .then((article) => {
            res.render('shop/pages/add-news', {
                pageTitle: 'Add News',
                path: '/add-news',
                editMode: true,
                article
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postEditNews = (req, res, next) => {
    const { title, imageUrl, date, description, articleId } = req.body

    News.findById(articleId)
        .then((article) => {
            article.title = title
            article.imageUrl = imageUrl
            article.article = article
            article.description = description

            article
                .save()
                .then(() => {
                    res.redirect('/news')
                })
                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postDeleteNews = (req, res, next) => {
    const articleId = req.body.articleId

    News.deleteOne({ _id: articleId, userId: req.user._id })
        .then(() => {
            res.redirect('/news')
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

// ==============================

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                products,
                path: '/admin/products'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        editMode: false,
        path: '/admin/add-product',

        errorMessage: req.flash('error'),
        errorsArray: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const price = req.body.price
    const description = req.body.description
    const image = req.file

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            errorMessage: errors.array()[0].msg,
            errorsArray: errors.array().map((e) => e.path),
            pageTitle: 'Add Product',
            editMode: true,
            product: { title, price, description },
            path: '/admin/add-product'
        })
    }

    if (!image) {
        return res.redirect('/admin/add-product')
    }

    const imageUrl = image.path

    const product = new Product({
        title,
        imageUrl,
        price,
        description,
        userId: req.user._id
    })

    product
        .save()
        .then(() => {
            res.redirect('/admin/add-product')
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId

    Product.findById(prodId)
        .then((product) => {
            console.log('product', product)
            res.render('admin/add-product', {
                pageTitle: 'Edit Product',
                editMode: true,
                product,
                path: '/admin/edit-product',
                errorMessage: req.flash('error'),
                errorsArray: []
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postEditProduct = (req, res, next) => {
    const { title, price, description, productId } = req.body
    const image = req.file

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            errorMessage: errors.array()[0].msg,
            errorsArray: errors.array().map((e) => e.path),
            pageTitle: 'Edit Product',
            editMode: true,
            product: { title, price, description, productId },
            path: '/admin/edit-product'
        })
    }

    if (!image) {
        res.redirect('/admin/products')
    }

    Product.findById(productId)
        .then((product) => {
            product.title = title
            product.price = price
            product.description = description

            if (image) {
                product.imageUrl = image.path
            }

            product
                .save()
                .then(() => {
                    res.redirect('/admin/products')
                })
                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId

    Product.findById(prodId).then((product) => {
        const productPrice = +product.price

        User.find()
            .then((users) => {
                users.forEach((user) => {
                    const productItem = user.cart.items.find(
                        (p) => p.productId.toString() === prodId.toString()
                    )

                    const updCartItems = user.cart.items.filter(
                        (p) => p.productId.toString() !== prodId.toString()
                    )

                    const updCartTotalPrice = productItem
                        ? (user.cart.totalPrice -=
                              productItem.quantity * productPrice)
                        : user.cart.totalPrice

                    user.cart = {
                        items: updCartItems,
                        totalPrice: updCartTotalPrice
                    }

                    console.log('user.cart', user.cart)

                    user.save()
                })

                return req.user.save()
            })
            .then(() => {
                return Product.deleteOne({ _id: prodId, userId: req.user._id })
            })
            .then(() => {
                res.redirect('/admin/products')
            })
            .catch((err) => {
                const error = new Error('')
                error.httpStatusCode = 500
                next(error)
            })
    })
}
