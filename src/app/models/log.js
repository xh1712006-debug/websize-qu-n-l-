const mongoose = require('mongoose')
const schema = mongoose.Schema

const logSchema = new schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // Có thể ref đến nhiều bảng tùy vào role, hoặc chỉ lưu ID và role
    },
    userRole: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    target: {
        type: String // Tên bảng hoặc đối tượng bị tác động
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    reason: {
        type: String // Quan trọng cho việc mở khóa điểm
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
})

const modelName = 'logs'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, logSchema)
