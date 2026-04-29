const mongoose = require('mongoose');
require('dotenv').config();

async function fixData() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const Project = require('../src/app/models/project');
        const Student = require('../src/app/models/student');
        const Teacher = require('../src/app/models/teacher');

        const projects = await Project.find({ major: { $exists: false } });
        console.log(`Found ${projects.length} projects without a major field.`);

        for (const p of projects) {
            let majorValue = null;
            if (p.studentId) {
                const student = await Student.findById(p.studentId);
                if (student) majorValue = student.studentMajor;
            }
            if (!majorValue && p.teacherId) {
                const teacher = await Teacher.findById(p.teacherId);
                if (teacher) majorValue = teacher.teacherMajor;
            }

            if (majorValue) {
                p.major = majorValue;
                await p.save();
                console.log(`Updated project ${p._id} with major: ${majorValue}`);
            } else {
                console.log(`Could not find major for project ${p._id}`);
            }
        }

        console.log('Data fix complete.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixData();
