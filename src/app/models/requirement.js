const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
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

const modelName = 'requirement'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)