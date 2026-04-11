const express = require('express')
const router = express.Router()

const projectRouter = require('../../app/Api/project')

// router.post('/', projectRouter.createproject)

router.get('/:id', projectRouter.getApiId)
router.get('/', projectRouter.index)




module.exports = router;
