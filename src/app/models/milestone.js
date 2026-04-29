const mongoose = require('mongoose')
const schema = mongoose.Schema

const milestoneSchema = new schema({
    title: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    major: {
        type: String,
        required: true // Gắn với chuyên ngành do Leader quản lý
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers'
    },
    status: {
        type: String,
        default: 'active' // active, expired, completed
    }
}, {
    timestamps: true,
})

const modelName = 'milestones'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, milestoneSchema)
