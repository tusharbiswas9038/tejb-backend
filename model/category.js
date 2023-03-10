const mongoose = require('mongoose');
// const router = require('../routers/categories');
// const { route } = require('../routers/categories');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }

})

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});


exports.Category = mongoose.model('Category', categorySchema);
