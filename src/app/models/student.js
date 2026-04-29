const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
    },
    fullName: {
        type: 'String'
    },
    studentCode: {
        type: 'String'
    },
    studentEmail: {
        type: 'String'
    },
    studentPhone: {
        type: 'String'
    },
    studentMajor: {
        type: 'String'
    },
    studentClass: {
        type: 'String'
    },
    studentCourse: {
        type: 'String'
    },
    studentAvatar: {
        type: 'String'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects',
    },
    password: {
        type: 'String'
    },
    periodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'period',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'waiting_confirm'],
        default: null
    },
    isMicrosoft: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})

const modelName = 'students'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)