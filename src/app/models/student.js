const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    id: {
        type: 'String'
    },
    fullName: {
        type: 'String'
    },
    studentCode: {
        type: 'String'
    },
    givenName: {
        type: 'String'
    },
    phont: {
        type: 'String'
    },
    StudentClass: {
        type: 'String'
    },
    studentEmail: {
        type: 'String'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },
    // studentPassword: {
    //     type: 'String'
    // },
    major: {
        type: 'String'
    },
    status: {
        type: 'String'
    },
    password: {
        type: 'String'
    }

}, {
    timestamps: true,
})

const modelName = 'students'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)