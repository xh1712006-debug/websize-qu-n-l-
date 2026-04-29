const mongoose = require('mongoose');
const Admin = require('./src/app/models/admin');

async function checkAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/student');
        const count = await Admin.countDocuments();
        console.log(`Current Admin Count: ${count}`);
        if (count > 0) {
            const admins = await Admin.find();
            console.log('Admins found:', admins);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAdmin();
