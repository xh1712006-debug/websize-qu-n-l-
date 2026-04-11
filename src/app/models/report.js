const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },  

    fileUrl: {
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

}, {
    timestamps: true,
})

const modelName = 'reports'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
