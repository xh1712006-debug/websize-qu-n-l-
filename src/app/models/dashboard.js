const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    name: String,
    email: String,
}, {
    timestamps: true,
})

const modelName = 'account'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
