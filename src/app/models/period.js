const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodSchema = new Schema({
    name: { type: String, required: true }, // VD: Hoc ky 2 - 2026
    semester: { type: String, required: true },
    year: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'CLOSED'], 
        default: 'ACTIVE' 
    },
    description: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('period', periodSchema);
