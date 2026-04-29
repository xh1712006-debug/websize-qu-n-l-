const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
    },
    savedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects'
    }]
}, {
    timestamps: true,
})

const modelName = 'admins'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)