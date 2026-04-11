const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
    },
    
}, {
    timestamps: true,
})

const modelName = 'listprojects'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)
