const studentData = require('../../models/student')
const scoreData = require('../../models/grade')

class pointController{
    async index(req,res) {
        try {
            res.render('admin/point', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'score'
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }

    async getScoreFeedback(req,res) {
        try {
            console.log('tạo đồ án')
            const data = []
            const student = await studentData.find()
            console.log('student: ', student)
            for(const item of student){
                console.log('item: ', item._id)
                const score = await scoreData.findOne({studentId: item._id})
                if(!score)
                    continue;

                data.push({
                    id: score._id,
                    fullName: item.fullName,
                    score: score.score ? score.score : 'chưa có điểm',
                    scoreFeedback: score.scoreFeedback ? score.scoreFeedback : 'chưa có điểm',

                })
            }
            console.log('data: ', data)
            return res.json(data)
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async updateScoreFeedback(req,res) {
        try{
            const data = req.body.data
            console.log('data: ', data)
            for(const item of data) {
                const scoreId = item.id
                const score = item.score
                const scoreFeedback = item.scoreFeedback

                console.log('scoreId: ', scoreId)
                console.log('score: ', score)
                console.log('scoreFeedback: ', scoreFeedback)

                const scores = await scoreData.findByIdAndUpdate(
                    scoreId,{
                    score: score,
                    scoreFeedback: scoreFeedback,
                    status: 'true',
                },{
                    new: true,
                })
            }
            return res.json({message: 'Cập nhật điểm và phản hồi thành công'})
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new pointController