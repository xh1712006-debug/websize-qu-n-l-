const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
        required: true,
    },
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requirementstudents',
    },

    fileUrl: {
        type: String,
    },
    externalLink: { // [NEW] Link Github/Drive
        type: String,
    },
    content: {
        type: String,
    },
    status: {
        type: String,
    },
    title: {
        type: String,
    },
    week: {
        type: Number,
    },
    teacherFeedback: {
        type: String,
    },
    progressScore: { // [NEW] Điểm thành phần (optional)
        type: Number,
    },

}, {
    timestamps: true,
})

const modelName = 'reports'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)