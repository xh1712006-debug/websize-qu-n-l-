const mongoose = require("mongoose")

async function connect() {
    try{
        await mongoose.connect("mongodb://localhost:27017/student")
        console.log('kết nối thành công')
    }
    catch(err){
        console.log('kết nói thất bại')
    }
}
mongoose.connection.once('open', () => {
  console.log('DB:', mongoose.connection.name)
  console.log(
    'Collections:',
    Object.keys(mongoose.connection.collections)
  )
})
module.exports = {connect};
