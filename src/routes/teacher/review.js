const express = require('express');
const router = express.Router();
const reviewController = require('../../app/contraller/teacher/reviewController');
const { checkGradeLock } = require('../../app/middleware/auth');

router.get('/', reviewController.index);
router.get('/dashboard', reviewController.getDashboard);
router.get('/schedule', reviewController.getSchedule);
router.get('/questions', reviewController.getQuestionsPage);
router.get('/getAssignedStudents', reviewController.getAssignedStudents);
router.post('/submitReview', reviewController.submitReview);
router.post('/submitQuestions', reviewController.submitQuestions);

module.exports = router;
