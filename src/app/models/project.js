const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
    },
    teacherFeedbackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    teacherFeedbackName: {
        type: String,
    },
    inputProject: {
        type: String,
    },
    contentProject: {
        type: String,
    },
    teacherInstruct: {
        type: String,
    },
    date: {
        type: Date,
    },
    statuss: {
        type: String,
    },
    numberStudent: {
        type: Number,
    },
    numberSubmit: {
        type: Number,
    },
    technology: {
        type: [String],
    }
}, {
    timestamps: true,
})

const modelName = 'projects'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)