const mongoose = require('mongoose');

async function migrate() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/student');
        console.log('Connected to MongoDB for migration...');

        const db = mongoose.connection.db;

        // 1. Migrate Teachers
        console.log('Migrating Teachers...');
        const teacherCollection = db.collection('teachers');
        const teachers = await teacherCollection.find({}).toArray();
        for (const t of teachers) {
            const update = {};
            if (t.role && !t.teacherRole) update.teacherRole = t.role;
            if (t.department && !t.teacherDepartment) update.teacherDepartment = t.department;
            if (t.degree && !t.teacherDegree) update.teacherDegree = t.degree;
            if (t.phone && !t.teacherPhone) update.teacherPhone = t.phone;

            // Chuyển đổi Role cũ sang mới
            if (update.teacherRole === 'Lecturer' || update.teacherRole === 'Senior' || update.teacherRole === 'Head') {
                update.teacherRole = 'GVHD';
            }

            if (Object.keys(update).length > 0) {
                await teacherCollection.updateOne({ _id: t._id }, { 
                    $set: update,
                    $unset: { role: "", department: "", degree: "", phone: "" } 
                });
            }
        }

        // 2. Migrate Students
        console.log('Migrating Students...');
        const studentCollection = db.collection('students');
        const students = await studentCollection.find({}).toArray();
        for (const s of students) {
            const update = {};
            if (s.phone && !s.studentPhone) update.studentPhone = s.phone;
            if (s.givenName && !s.studentGivenName) update.studentGivenName = s.givenName;
            
            // Thêm các trường mới mặc định
            if (!s.studentMajor) update.studentMajor = 'Chưa cập nhật';
            if (!s.studentClass) update.studentClass = 'Chưa cập nhật';
            if (!s.studentCourse) update.studentCourse = 'K6x';

            if (Object.keys(update).length > 0) {
                await studentCollection.updateOne({ _id: s._id }, { 
                    $set: update,
                    $unset: { phone: "", givenName: "" }
                });
            }
        }

        console.log('Migration completed successfully!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
