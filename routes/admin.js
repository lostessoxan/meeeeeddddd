const express = require('express')
const router = express.Router()
const { check, body } = require('express-validator')
const isAuth = require('../middleware/is-auth')

const adminController = require('../controllers/admin')

// ================================== >>>>>>

router.get('/add-news', adminController.getAddNews)
router.post('/add-news', adminController.postAddNews)

router.get('/edit-news/:articleId', adminController.getEditNews)
router.post('/edit-news', adminController.postEditNews)

router.post('/delete-news', adminController.postDeleteNews)

// ================================== >>>>>>

exports.getEditNews = (req, res, next) => {
    const prodId = req.params.productId

    Product.findById(prodId)
        .then((product) => {
            console.log('product', product)
            res.render('admin/add-product', {
                pageTitle: 'Add Product',
                editMode: true,
                product,
                path: '/admin/edit-product'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

// =====================================

router.get('/products', adminController.getProducts)

router.get('/add-product', adminController.getAddProduct)
router.post(
    '/add-product',
    [
        body('title', 'Please enter a correct Title.')
            .isString()
            .isLength({ min: 5 }),
        body('price', 'Please enter a correct Price.')
            .trim()
            .isLength({ min: 1 }),
        body('description', 'Please enter a correct Description.')
            .trim()
            .isLength({ min: 5, max: 400 })
    ],
    isAuth,
    adminController.postAddProduct
)

router.get('/add-product/:productId', adminController.getEditProduct)
router.post(
    '/edit-product',
    [
        body('title', 'Please enter a correct Title.')
            .isString()
            .isLength({ min: 5 }),
        body('price', 'Please enter a correct Price.')
            .trim()
            .isLength({ min: 1 }),
        body('description', 'Please enter a correct Description.')
            .trim()
            .isLength({ min: 5, max: 400 })
    ],
    isAuth,
    adminController.postEditProduct
)

router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router
