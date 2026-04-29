const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    name: {
        type: String,
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
    }
    
}, {
    timestamps: true,
})

const modelName = 'requirementstudents'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
