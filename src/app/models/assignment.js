const mongoose = require('mongoose')
const schema = mongoose.Schema

const conversation = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
    }, 
    teacherId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects',
    },
    role: {
        type: String,
    }
}, {
    timestamps: true,
})

const modelName = 'assignments'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, conversation)