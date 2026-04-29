const router_student = require('./student/index')
const router_teacher = require('./teacher/index')
const router_admin = require('./admin/index')
const router_Api = require('./Api/index')
const router_microsoft = require('./microsoft/index')

function router(app){
    app.use('/student',router_student)
    app.use('/admin',router_admin)
    app.use('/loggin', require('./accounts/loggin'))
    app.use('/teacher', router_teacher)
    app.use('/Api', router_Api)
    app.use('/api/auth', router_microsoft)
}

module.exports = router;