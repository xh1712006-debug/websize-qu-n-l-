const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

async function checkProjects() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const Project = require('../src/app/models/project');
        const Teacher = require('../src/app/models/teacher');

        const projects = await Project.find({}).populate('studentId', 'fullName').populate('teacherId', 'fullName');
        console.log('\n--- ALL PROJECTS (' + projects.length + ') ---');
        projects.forEach(p => {
            console.log({
                id: p._id,
                name: p.inputProject,
                major: p.major,
                statuss: p.statuss,
                status: p.status,
                student: p.studentId ? p.studentId.fullName : 'N/A',
                teacher: p.teacherId ? p.teacherId.fullName : 'N/A'
            });
        });

        console.log('\n--- TEACHERS (LEADERS) ---');
        const leaders = await Teacher.find({ 'subRoles.isLeader': true });
        leaders.forEach(l => {
            console.log({
                id: l._id,
                fullName: l.fullName,
                major: l.teacherMajor
            });
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error in checkProjects:', err);
        process.exit(1);
    }
}

checkProjects();
