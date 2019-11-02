const express = require("express"),
    app = express(),
    path = require("path"),
    session = require("express-session"),
    {user,task} = require("./model/sch"),
    Mongosession = require("connect-mongo")(session)
    mongoose = require("mongoose");

//连接数据库
mongoose.connect('mongodb://localhost/a',{useNewUrlParser: true});


app.use(session({
    secret:'aasdad',//密钥
    rolling:true,//每次操作页面  都会重新设定时间，可以保证操作的时候不会掉
    resave:false,//是否每次请求都重新保存数据
    saveUninitialized:false,//是否设置初始值，true会给一个默认的cookieid
    cookie:{maxAge:1000*60*60},
    store:new Mongosession({
        url:'mongodb://localhost/a'
    })//把id存储到的地方，默认是存到内存中
}))

//获取post传过来的参数
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//静态资源目录
app.use(express.static(__dirname + '/public'));

//模板引擎
app.set('views',path.join(__dirname,'view'));
app.set('view engine','ejs');

app.use('/',require('./router/index.js'))

app.use('/api',require('./router/api'))

app.use('/admin',require('./router/admin'))

app.listen(233);