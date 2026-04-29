const studentData = require('../../models/student');
const teacherData = require('../../models/teacher');
const projectData = require('../../models/project');
const reportData = require('../../models/report');

class dashboardController {
    async index(req, res) {
        try {
            // 1. Basic Counts
            const totalStudents = await studentData.countDocuments();
            const totalTeachers = await teacherData.countDocuments();
            const totalProjects = await projectData.countDocuments({ statuss: 'active' });
            
            const unregisteredCount = await studentData.countDocuments({ 
                $or: [{ projectId: null }, { projectId: { $exists: false } }] 
            });

            // 4. Major Distribution
            const majorAgg = await studentData.aggregate([
                { $group: { _id: "$studentMajor", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // 5. Advisor Statistics (Top advisors by student count - Robust version)
            const advisorAgg = await projectData.aggregate([
                { $match: { statuss: 'active' } },
                { 
                    $group: { 
                        _id: "$teacherId", 
                        count: { $sum: 1 },
                        fallbackName: { $first: "$teacherInstruct" } 
                    } 
                },
                {
                    $lookup: {
                        from: "teachers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "teacherInfo"
                    }
                },
                { $unwind: { path: "$teacherInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ["$teacherInfo.fullName", "$fallbackName", "Chưa rõ"] },
                        count: 1
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // 6. Score Distribution (Phổ điểm)
            const gradeModel = require('../../models/grade');
            const grades = await gradeModel.find({ status: 'approved', finalScore: { $exists: true } });
            const scoreDist = {
                '0-4': 0,
                '4-6': 0,
                '6-8': 0,
                '8-10': 0
            };
            grades.forEach(g => {
                if (g.finalScore < 4) scoreDist['0-4']++;
                else if (g.finalScore < 6) scoreDist['4-6']++;
                else if (g.finalScore < 8) scoreDist['6-8']++;
                else scoreDist['8-10']++;
            });

            res.render('admin/dashboard', {
                layout: 'base',
                figure: 'admin',
                active: 'admin/dashboard',
                stats: {
                    totalStudents,
                    totalTeachers,
                    totalProjects,
                    unregisteredCount
                },
                charts: {
                    majorLabels: JSON.stringify(majorAgg.map(m => m._id || 'Khác')),
                    majorValues: JSON.stringify(majorAgg.map(m => m.count)),
                    advisorLabels: JSON.stringify(advisorAgg.map(a => a.name)),
                    advisorValues: JSON.stringify(advisorAgg.map(a => a.count)),
                    scoreDist: JSON.stringify(scoreDist)
                }
            })


        }
        catch (err) {
            console.error('Admin Dashboard Error:', err);
            res.status(500).send('Lỗi tải dữ liệu dashboard')
        }
    }
}

module.exports = new dashboardController
