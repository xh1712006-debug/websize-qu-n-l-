const mongoose = require('mongoose');
require('dotenv').config();

async function checkTotal() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student');
        console.log('Connected');

        const Project = require('../src/app/models/project');
        const count = await Project.countDocuments({});
        console.log('Total Projects in DB:', count);

        const projects = await Project.find({}, 'inputProject major statuss status');
        console.log(JSON.stringify(projects, null, 2));

        const Teacher = require('../src/app/models/teacher');
        const leaders = await Teacher.find({ 'subRoles.isLeader': true }, 'fullName teacherMajor');
        console.log('\nLeaders:', JSON.stringify(leaders, null, 2));

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
checkTotal();
