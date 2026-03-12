const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
}, {
    timestamps: true,
})

const modelName = 'account'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)