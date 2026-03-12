const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    email: {
        type: String,
    },
    password: {
        type: String
    }
}, {
    timestamps: true,
})

const modelName = 'admins'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)