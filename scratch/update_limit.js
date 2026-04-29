const mongoose = require('mongoose');
const configModel = require('../src/app/models/config');

async function updateLimit() {
    try {
        await mongoose.connect('mongodb://localhost:27017/student');
        console.log('Connected to DB');
        
        const result = await configModel.findOneAndUpdate(
            { key: 'maxStudentsPerAdvisor' },
            { value: '5' },
            { upsert: true, new: true }
        );
        
        console.log('Updated limit to:', result.value);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateLimit();
