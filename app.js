const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const sass = require('node-sass')
const multer = require('multer')

const session = require('express-session')
const flash = require('connect-flash')
const csrf = require('csurf')
const MongoDBStore = require('connect-mongodb-session')(session)

const MONGODB_URI =
    'mongodb+srv://lostessoxan:xanaxPalette7@cluster1.lkotkqa.mongodb.net/medicineDb?retryWrites=true&w=majority'

const app = express()

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const User = require('./models/user')

// ===========================

const shopRoutes = require('./routes/shop')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')

// ===========================

app.use(express.urlencoded({ extended: false }))
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)
app.use(express.static(path.resolve('public')))
app.use('/images', express.static(path.resolve('images')))
app.use(
    session({
        secret: 'lostessoxan',
        resave: false,
        saveUninitialized: false,
        store: store
    })
)
app.use(flash())
app.use(csrfProtection)

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken()
    res.locals.isAuthenticated = req.session.isLoggedIn
    next()
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user
            next()
        })
        .catch((err) => {
            next(new Error(''))
        })
})

// ===========================

app.set('view engine', 'ejs')
app.set('views', 'views')

// ===========================

app.use(shopRoutes)
app.use('/admin', adminRoutes)
app.use(authRoutes)

// ===========================

app.use((req, res, next) => {
    res.render('404', { pageTitle: '404 Page', path: '/404' })
})

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: '500',
        isAuthenticated: req.session.isLoggedIn,
        path: '/500'
    })
})

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log('http://localhost:3000')
        })
    })
    .catch((err) => {
        console.log(err)
    })
