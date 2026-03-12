const mongoose = require('mongoose')
const schema = mongoose.Schema

const ContentSchema = new schema({
    
}, 
{
    timestamps: true,
})
module.exports = mongoose.model('dk_use', ContentSchema)
