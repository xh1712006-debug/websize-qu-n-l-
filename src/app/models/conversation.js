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
}, {
    timestamps: true,
})

const modelName = 'aconversations'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, conversation)
