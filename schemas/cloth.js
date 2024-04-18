var mongoose = require('mongoose');

var clothSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    photourl: {
        type: String,
    },
    price: Number,
    size: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'size'
    },
    description:{
        type: String,
    },
    quality: Number,
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
module.exports = new mongoose.model('cloth', clothSchema)