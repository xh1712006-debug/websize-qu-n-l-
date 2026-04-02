const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teaccher',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },
    score: {
        type: Number,
    },
    scoreFeedback: {
        type: Number,
    },
    comment: {
        type: String,
    },
    approvedBy: {
        type: String, // adminId
    },
    status: {
        type: String, // pending | approved | rejected
    },
    
   
}, {
    timestamps: true,
})

const modelName = 'grades'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)