const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { check, body } = require('express-validator')

const authController = require('../controllers/auth')
const User = require('../models/user')

let loginUser

router.get('/login', authController.getLogin)
router.post(
    '/login',
    [
        check('email', 'Please enter a correct E-Mail')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (!user) {
                        return Promise.reject(`E-Mail doesn't exists!`)
                    }
                    req.loginUser = user
                })
            }),
        body(
            'password',
            'Please enter a correct password. It must contains only text and numbers and at least 5 characters'
        )
            .trim()
            .isAlphanumeric()
            .isLength({ min: 5 })
            .custom((value, { req }) => {
                return bcrypt
                    .compare(value, req.loginUser.password)
                    .then((doMatch) => {
                        if (!doMatch) {
                            return Promise.reject(`Password doesn't match`)
                        }
                    })
            })
    ],
    authController.postLogin
)

router.get('/signup', authController.getSignup)
router.post(
    '/signup',
    [
        check('email', 'Please enter a correct E-Mail')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject('E-Mail already exists!')
                    }
                })
            }),
        body(
            'password',
            'Please enter a correct password. It must contains only text and numbers and at least 5 characters'
        )
            .trim()
            .isAlphanumeric()
            .isLength({ min: 5 }),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match')
                }
                return true
            })
    ],
    authController.postSignup
)

router.post('/logout', authController.postLogout)

router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)

module.exports = router
