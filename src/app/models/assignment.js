const mongoose = require('mongoose')
const schema = mongoose.Schema

const conversation = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
    }, 
    teacherId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },
    role: {
        type: String,
    }
}, {
    timestamps: true,
})

const modelName = 'assignments'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, conversation)