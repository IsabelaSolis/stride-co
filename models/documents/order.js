const mongoose = require('mongoose');

// Los montos se guardan como Decimal128 y no pueden ser negativos
const money = (extra = {}) => ({
    type: mongoose.Schema.Types.Decimal128,
    validate: {
        validator: (value) => value === undefined || value === null || Number(value.toString()) >= 0,
        message: 'amount cannot be negative'
    },
    ...extra
});

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesPersonId: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'], required: true },
    totals: {
        subtotal: money({ required: true }),
        shipping: money({ default: 0 }),
        discount: money({ default: 0 }),
        total: money({ required: true })
    },
    shippingAddress: {
        street: String,
        number: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    items: {
        type: [
            {
                productId: { type: Number, required: true }, // id del producto del modelo relacional
                quantity: { type: Number, required: true, min: 1 },
                unitPrice: money({ required: true })
            }
        ],
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: 'an order needs at least one item'
        }
    },
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

// Decimal128 se entrega como numero en las respuestas JSON
const toNumber = (value) => (value === undefined || value === null ? value : Number(value.toString()));
orderSchema.set('toJSON', {
    transform(doc, ret) {
        if (ret.totals) {
            for (const key of ['subtotal', 'shipping', 'discount', 'total']) {
                ret.totals[key] = toNumber(ret.totals[key]);
            }
        }
        if (ret.items) ret.items.forEach((item) => { item.unitPrice = toNumber(item.unitPrice); });
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Order', orderSchema);