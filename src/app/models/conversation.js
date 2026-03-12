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
}, {
    timestamps: true,
})

const modelName = 'aconversations'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, conversation)