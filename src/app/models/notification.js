const mongoose = require('mongoose')
const schema = mongoose.Schema

const notificationSchema = new schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Có thể là StudentId hoặc TeacherId hoặc AdminId
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['success', 'warning', 'info', 'error'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String, // Đường dẫn để người dùng click vào chuyển trang (ví dụ: /student/project)
        default: '#'
    }
}, {
    timestamps: true
})

const modelName = 'notifications'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, notificationSchema)
