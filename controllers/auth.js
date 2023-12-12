const bcrypt = require('bcryptjs')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { validationResult } = require('express-validator')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'absolutewes1de@gmail.com',
        pass: 'dqav setp slow zuun'
    }
})

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        errorsArray: [],
        path: '/login'
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            errorsArray: errors.array().map((e) => e.path),
            path: '/login'
        })
    }

    req.session.isLoggedIn = true
    req.session.user = req.loginUser

    return req.session.save((err) => {
        if (err) console.log(err)
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign up',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '', confirmPassword: '' },
        errorsArray: [],
        path: '/signup'
    })
}

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign up',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password, confirmPassword },
            errorsArray: errors.array().map((e) => e.path),
            path: '/login'
        })
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email,
                password: hashedPassword,
                cart: { items: [], totalPrice: 0 }
            })

            return user.save()
        })
        .then(() => {
            res.redirect('/login')
            transporter.sendMail({
                from: 'Shop NODEJS <absolutewes1de@gmail.com>',
                to: email,
                subject: 'Registration was successful',
                html: `
                    <style>
                        h3 {
                            padding: 1rem;
                            border-radius: 3px;
                            background: rgb(166, 222, 148);
                            color: #393939;
                            font-size: 2rem;
                            text-align: center;
                        }
                    </style>
                    <h3>You have successfully registered on our site!</h3>
                `
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/login')
    })
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset password',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '', confirmPassword: '' },
        errorsArray: [],
        path: '/reset'
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex')

        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash('error', 'This E-Mail doesn`t exist!')
                    return res.redirect('/reset')
                }

                user.resetToken = token
                user.resetTokenExpirationDate = Date.now() + 3600000
                user.save()
                    .then(() => {
                        res.redirect('/')
                    })
                    .then(() => {
                        transporter.sendMail({
                            from: 'Shop NODEJS <absolutewes1de@gmail.com>',
                            to: req.body.email,
                            subject: 'Password Reset',
                            html: `
                                <h1>You requested a password reset.</h1>
                                <hr/>
                                <p>Click <a href="http://localhost:3000/reset/${token}">here</a> to set a new password</p>
                            `
                        })
                    })
                    .catch((err) => {
                        const error = new Error('')
                        error.httpStatusCode = 500
                        next(error)
                    })
            })
            .catch((err) => {
                const error = new Error('')
                error.httpStatusCode = 500
                next(error)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token

    User.findOne({
        resetToken: token,
        resetTokenExpirationDate: { $gt: Date.now() }
    })
        .then((user) => {
            if (!user) {
                req.flash('error', `Your token's expiration date is gone`)
                return res.redirect('/login')
            }

            res.render('auth/new-password', {
                pageTitle: 'Reset Password',
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: req.flash('error'),
                oldInput: { email: '', password: '', confirmPassword: '' },
                errorsArray: [],
                path: '/update'
            })
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}

exports.postNewPassword = (req, res, next) => {
    const { password, userId, passwordToken } = req.body
    let resetUser

    User.findOne({
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpirationDate: { $gt: Date.now() }
    })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Something went wrong')
                return res.redirect('/login')
            }

            resetUser = user
            return bcrypt.hash(password, 12)
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpirationDate = undefined

            return resetUser.save()
        })
        .then(() => {
            return res.redirect('/login')
        })
        .catch((err) => {
            const error = new Error('')
            error.httpStatusCode = 500
            next(error)
        })
}
