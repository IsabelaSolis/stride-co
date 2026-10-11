const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesPersonId: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'], required: true },
    totals: {
        subtotal: { type: mongoose.Schema.Types.Decimal128, required: true },
        shipping: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        discount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        total: { type: mongoose.Schema.Types.Decimal128, required: true }
    },
    shippingAddress: {
        street: String,
        number: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    items: [
        {
            productId: { type: Number, required: true }, // id del producto del modelo relacional
            quantity: { type: Number, required: true, min: 1 },
            unitPrice: { type: mongoose.Schema.Types.Decimal128, required: true }
        }
    ],
    statusHistory: [
        {
            status: { type: String, enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'], required: true },
            changedById: { type: Number, required: true }, // id del usuario que cambió el estado
            changedAt: { type: Date, default: Date.now },
            note: String 
        }
    ]
}, {timestamps: true}
);

module.exports = mongoose.model('Order', orderSchema);