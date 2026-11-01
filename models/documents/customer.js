const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9+()\-\s]{7,20}$/, 'phone has an invalid format']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
        match: [/^\S+@\S+\.\S+$/, 'email has an invalid format']
    },

    // Lista de direcciones del cliente EMBEBIDO (vive dentro de otra entidad)
    addresses: [
        {
            type: { type: String, enum: ['SHIPPING', 'BILLING'], required: true},
            street: { type: String, required: true },
            number: String,
            city: { type: String, required: true },
            state: String,
            postalCode: String,
            country: { type: String, required: true }
        }
    ]
}, {
    timestamps: true
});

customerSchema.set('toJSON', {
    transform(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Customer', customerSchema);