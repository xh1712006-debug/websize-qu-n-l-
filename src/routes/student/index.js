const express = require('express')
const router = express.Router()
const contentStudent = require('../../app/models/student')

router.use(async (req, res, next) => {
    if (req.session.student) {
        try {
            const student = await contentStudent.findById(req.session.student)
            if (student && student.status === 'approved') {
                res.locals.hasProject = true;
            } else {
                res.locals.hasProject = false;
            }
        } catch (err) {
            console.log(err)
        }
    }
    next()
})

router.use('/project', require('./project'))
router.use('/addproject', require('./addproject'))
router.use('/feedback', require('./feedback'))
router.use('/report', require('./report'))
router.use('/dashboard', require('./dashboard'))
router.use('/account', require('./account'))
router.use('/score', require('./score'))


module.exports = router
