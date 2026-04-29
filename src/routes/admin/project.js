const express = require('express')
const router = express.Router()
const projectRouter = require('../../app/controller/admin/project')

router.delete('/:id', projectRouter.deleteProject)
router.get('/', projectRouter.index)
router.get('/getProjects', projectRouter.getProjects)
router.get('/create', projectRouter.create)
router.get('/listStudent', projectRouter.listStudent)
router.get('/fixStudent/:id', projectRouter.fixStudent)
router.put('/fixStudent/:id', projectRouter.putFixStudent)
router.post('/create', projectRouter.createProject)
router.get('/viewStudent/:id', projectRouter.viewStudent)
router.get('/getListViewStudent', projectRouter.getListViewStudent)

<<<<<<< HEAD
// Reviewer Assignment
router.get('/getGvpbs', projectRouter.getGvpbs)
router.post('/assignReviewer', projectRouter.assignReviewer)

module.exports = router;
=======
module.exports = router;
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
