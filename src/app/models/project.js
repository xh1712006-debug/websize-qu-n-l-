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
    inputProject: {
        type: String,
    },
    contentProject: {
        type: String,
    },
    teacherInstruct: {
        type: String,
    },
    teacherFeedback: {
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
}, {
    timestamps: true,
})

const modelName = 'projects'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)