const express = require('express')
const router = express.Router()

const shopController = require('../controllers/shop')
const isAuth = require('../middleware/is-auth')

router.get('/', shopController.getIndex)

router.get('/about', shopController.getAbout)

router.get('/services', shopController.getServices)

router.get('/payment', shopController.getPayment)

router.get('/news', shopController.getNews)
router.get('/news/:articleId', shopController.getNewsDetails)

router.get('/contact', shopController.getContact)

// ================================== >>>>>>

router.get('/products', shopController.getProducts)

router.get('/products/:productId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)
router.post('/cart', isAuth, shopController.postCart)
router.post('/cart-delete', isAuth, shopController.postCartDelete)

router.get('/orders', isAuth, shopController.getOrders)
router.post('/orders', isAuth, shopController.postOrders)

router.get('/orders/:orderId', isAuth, shopController.getInvoice)

module.exports = router
