const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true,
    },
    precent: {
        type: Number,
    },
    comment: {
        type: String,
    },
    status: {
        type: String,  // "pending" | "pass" | "fail"
    },
}, {
    timestamps: true,
})

const modelName = 'progresses'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)