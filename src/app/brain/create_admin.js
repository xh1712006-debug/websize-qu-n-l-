const mongoose = require('mongoose');
const Admin = require('../models/admin');

async function createDefaultAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/student');
        
        const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
        if (!existingAdmin) {
            const newAdmin = new Admin({
                fullName: 'System Administrator',
                email: 'admin@gmail.com',
                password: 'admin123', // Trong thực tế nên hash password
                role: 'Admin'
            });
            await newAdmin.save();
            console.log('Default Admin created: admin@gmail.com / admin123');
        } else {
            console.log('Admin already exists.');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error creating admin:', err);
    }
}

createDefaultAdmin();
