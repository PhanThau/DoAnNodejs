var mongoose = require('mongoose');

var sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
}, { timestamps: true })

sizeSchema.virtual('published',{
    ref:'cloth',
    foreignField:'size',
    localField:'_id'
})
sizeSchema.set('toObject',{virtuals:true})
sizeSchema.set('toJSON',{virtuals:true})
module.exports = new mongoose.model('size', sizeSchema)