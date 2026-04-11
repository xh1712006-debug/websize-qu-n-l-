require('dotenv').config()
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const handlebars = require('express-handlebars')
const db = require('./config/db')
// const multer = require('multer')
const session = require('express-session')
const connectMongo = require('connect-mongo')
const MongoStore = connectMongo.default || connectMongo




const router = require('./routes/index')
// const router_teacher = require('./routes/teacher/index')

const app = express()
const port = 3000

app.use(session({
    secret: 'abc123',   // có thể đổi thành chuỗi bí mật hơn
    resave: false,
    saveUninitialized: false,

    // 🔥 LƯU SESSION VÀO MONGODB
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/student',
        collectionName: 'sessions'
    }),

    cookie: {
        maxAge: 9000 * 60 * 60  // 1 giờ
    }
}))




app.use(express.json())
app.use(express.urlencoded({ extended: true }))


db.connect()

app.use(morgan('combined'))

app.use('/uploads', express.static('upload/file'))
app.use(express.static(path.join(__dirname,'public\\css')))
app.use(express.static(path.join(__dirname,'public\\img')))
app.use(express.static(path.join(__dirname,'public\\js')))
// app.use(express.static(path.join(__dirname,'uploads')))





app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    defaultLayout: false, 
    helpers: {
        eq: (a,b) => a===b,
    }
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname,'resources\\views\\layouts'))


router(app)
// router_teacher(app)

app.listen(port,  '0.0.0.0',() => {
    console.log(`chao ca nha http://localhost:${port}/loggin`)
})
