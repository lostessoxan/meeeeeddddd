const { ObjectId } = require('mongodb')
const { Schema, model } = require('mongoose')

const orderSchema = new Schema({
    user: {
        email: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        }
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true }
})

module.exports = model('Order', orderSchema)
