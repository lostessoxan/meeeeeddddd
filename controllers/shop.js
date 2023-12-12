const Product = require('../models/product')
const Order = require('../models/order')
const News = require('../models/news')
const fs = require('fs')
const path = require('path')

exports.getIndex = (req, res, next) => {
    res.render('shop/pages/index', { pageTitle: 'Shop', path: '/' })
}

exports.getAbout = (req, res, next) => {
    res.render('shop/pages/about', { pageTitle: 'About', path: '/about' })
}

exports.getServices = (req, res, next) => {
    res.render('shop/pages/services', {
        pageTitle: 'Services',
        path: '/services'
    })
}

exports.getPayment = (req, res, next) => {
    res.render('shop/pages/payment', {
        pageTitle: 'Payment',
        path: '/payment'
    })
}

exports.getNews = (req, res, next) => {
    console.log('start')
    News.find()
        .then((news) => {
            console.log(news)
            res.render('shop/pages/news', {
                pageTitle: 'News',
                news: news,
                path: '/news',
                userId: req.user._id
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getNewsDetails = (req, res, next) => {
    const articleId = req.params.articleId

    News.findById(articleId)
        .then((article) => {
            res.render('shop/pages/news-details', {
                pageTitle: 'article details',
                article,
                path: '/news-details'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getContact = (req, res, next) => {
    res.render('shop/pages/contact', {
        pageTitle: 'Contact',
        path: '/contact'
    })
}

// ============================== >>

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/products', {
                pageTitle: 'Products',
                products,
                path: '/products'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    console.log(prodId)

    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-details', {
                pageTitle: 'Product Details',
                product,
                path: '/products'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then((user) => {
            res.render('shop/cart', {
                pageTitle: 'Cart',
                products: user.cart.items,
                totalPrice: user.cart.totalPrice,
                path: '/cart'
            })
        })
        .catch((err) => {
            console.log(err)
        })
}

exports.postCart = (req, res, next) => {
    const { productId } = req.body

    req.user.addToCart(productId).then(() => {
        res.redirect('/products')
    })
}

exports.postCartDelete = (req, res, next) => {
    const { productId } = req.body

    req.user.removeFromCart(productId).then(() => {
        res.redirect('/cart')
    })
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .populate('products.product')
        .then((orders) => {
            res.render('shop/orders', {
                pageTitle: 'Orders',
                orders,
                path: '/orders'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postOrders = (req, res, next) => {
    const products = req.user.cart.items.map((p) => {
        return { product: p.productId, quantity: p.quantity }
    })

    const order = new Order({
        user: { email: req.user.email, userId: req.user },
        products,
        totalPrice: req.user.cart.totalPrice
    })

    order
        .save()
        .then(() => {
            req.user.cart = { items: [], totalPrice: 0 }
            return req.user.save()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId
    const invoiceName = 'invoice-' + orderId + '.pdf'
    const invoicePath = path.join('data', 'invoices', invoiceName)

    fs.readFile(invoicePath, (err, data) => {
        if (err) return next(err)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="' + invoiceName + '"'
        )
        res.send(data)
    })
}
