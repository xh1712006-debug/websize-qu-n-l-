const mongoose = require('mongoose')
const schema = mongoose.Schema

const councilSchema = new schema({
    councilName: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    chairmanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
        required: true
    },
    secretaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
        required: true
    },
    memberIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers'
    }],
    major: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'active' // active, finished
    }
}, {
    timestamps: true,
})

const modelName = 'councils'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, councilSchema)
