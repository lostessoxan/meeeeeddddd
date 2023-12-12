const { ObjectId } = require('mongodb')
const { Schema, model } = require('mongoose')
const Product = require('../models/product')

const userSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    resetToken: String,
    resetTokenExpirationDate: Date,
    cart: {
        items: [
            {
                productId: {
                    type: ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: true
        }
    }
})

userSchema.methods.addToCart = function (prodId) {
    const cartProductIndex = this.cart.items.findIndex(
        (p) => p.productId.toString() === prodId.toString()
    )

    console.log(cartProductIndex)

    let updCartItems = [...this.cart.items]
    let updCartTotalPrice = +this.cart.totalPrice

    return Product.findById(prodId)
        .then((product) => {
            if (cartProductIndex !== -1) {
                updCartItems[cartProductIndex].quantity += 1
            } else {
                updCartItems.push({ productId: prodId, quantity: 1 })
            }

            updCartTotalPrice += +product.price

            this.cart = { items: updCartItems, totalPrice: updCartTotalPrice }

            return this.save()
        })
        .catch((err) => {
            console.log(err)
        })
}

userSchema.methods.removeFromCart = function (prodId) {
    return Product.findById(prodId)
        .then((product) => {
            const productPrice = +product.price

            const productQty = this.cart.items.find(
                (p) => p.productId.toString() === prodId.toString()
            ).quantity

            const updCartItems = this.cart.items.filter(
                (p) => p.productId.toString() !== prodId.toString()
            )
            const updCartTotalPrice = (this.cart.totalPrice -=
                productPrice * productQty)

            this.cart = { items: updCartItems, totalPrice: updCartTotalPrice }
            console.log(this.cart)
            return this.save()
        })
        .catch((err) => {
            console.log(err)
        })
}

module.exports = model('User', userSchema)
