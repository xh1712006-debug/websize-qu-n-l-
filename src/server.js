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
        maxAge: 9000 * 60 * 60 * 24  // 1 ngày
    }
}))




app.use(express.json())
app.use(express.urlencoded({ extended: true }))


db.connect()

app.use(morgan('combined'))

app.use('/uploads', express.static('upload/file'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public/js')))
app.use(express.static(path.join(__dirname, 'public/css')))
app.use(express.static(path.join(__dirname, 'public/img')))





app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials'),
    defaultLayout: false, 
    helpers: {
        eq: (a,b) => a===b,
        not: (v) => !v,
        substring: (str, start, end) => {
            if (typeof str !== 'string') return '';
            return str.substring(start, end);
        },
        dateFormat: (date, format) => {
            if (!date) return '--';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            return d.toLocaleString('vi-VN', { hour12: false });
        },
        json: (context) => {
            return JSON.stringify(context);
        },
        or: function() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        },
        and: function() {
            return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
        },
        mod: (a, b) => a % b,
        formatDate: (date, format) => {
            if (!date) return '--';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            if (format === 'MMM') return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            if (format === 'DD') return d.getDate().toString().padStart(2, '0');
            return d.toLocaleDateString('vi-VN');
        },
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        math: (lvalue, operator, rvalue) => {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        },
        divide: (a, b) => {
            if (b == 0) return 0;
            return a / b;
        },
        multiply: (a, b) => {
            return a * b;
        },
        sum: (a, b) => (1 * a) + (1 * b),
        percent: (a, b) => {
            if (!b || b === 0) return 0;
            return ((a / b) * 100).toFixed(0);
        },
        gt: (a, b) => a > b,
        ge: (a, b) => a >= b,
        substring: (str, start, len) => {
            if (!str) return '';
            return str.toString().substring(start, len);
        }
    }
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname,'resources\\views\\layouts'))


router(app)
// router_teacher(app)

app.listen(port,  '0.0.0.0',() => {
    console.log(`chao ca nha http://localhost:${port}/loggin`)
})