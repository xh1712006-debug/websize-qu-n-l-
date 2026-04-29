const mongoose = require('mongoose')
const schema = mongoose.Schema

const configSchema = new schema({
    key: {
        type: String,
        unique: true,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
})

const modelName = 'configs'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, configSchema)
