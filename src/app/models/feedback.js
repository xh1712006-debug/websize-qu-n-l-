const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'aconversation',
    },
    // contentId chính là id của sinh viên và giáo viên
    
    contentId: mongoose.Schema.Types.ObjectId,
    contentType: {
        type: String,
        enum: ['student', 'teacher'],
    },


    content: {
        type: String,
    },
   
}, {
    timestamps: true,
})

const modelName = 'feedbacks'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)