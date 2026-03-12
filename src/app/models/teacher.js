const mongoose = require('mongoose')
const schema = mongoose.Schema

const dashboardSchema = new schema({
    teacherCode: {
        type: 'String'
    },
    fullName: {
        type: 'String'
    },
    teacherRole: {
        type: 'String'
    },
    teacherEmail: {
        type: 'String'
    },
    teacherPhone: {
        type: 'String'
    },
    teacherDate: {
        type: 'String'
    },
    teacherGender: { 
        type: 'String'
    },
    // teacherAddress: {
    //     type: 'String'
    // },
    teacherAvatar: {
        type: 'String'
    },
    teacherDepartment: {
        type: 'String'
    },
    teacherDegree: {
        type: 'String'
    },
    status: {
        type: 'String'
    },

}, {
    timestamps: true,
})

const modelName = 'teachers'
module.exports = mongoose.models[modelName] || mongoose.model(modelName, dashboardSchema)