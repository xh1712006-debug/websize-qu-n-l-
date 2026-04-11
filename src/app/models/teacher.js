const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherCode: {
        type: 'String'
    },
    fullName: {
        type: 'String'
    },
    teacherEmail: {
        type: 'String'
    },
    phone: {
        type: 'String'
    },
    role: {
        type: 'String'
    },
    department: {
        type: 'String'
    },
    degree: {
        type: 'String'
    },
    status: {
        type: 'String'
    },
    password: {
        type: 'String'
    },

}, {
    timestamps: true,
})

const modelName = 'teachers'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
