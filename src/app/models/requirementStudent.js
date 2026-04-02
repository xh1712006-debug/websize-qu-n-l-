const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    name: {
        type: String,
    },
    status: {
        type: String,
    }
    
}, {
    timestamps: true,
})

const modelName = 'requirementstudents'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)