const express = require('express');
const router = express.Router();
const archiveController = require('../../app/contraller/admin/archive');

router.get('/', archiveController.index);
router.get('/period/:id', archiveController.viewDetail);
router.get('/api/projects/:periodId', archiveController.getArchivedProjects);

module.exports = router;
