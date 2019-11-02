const express = require('express')
    router = express.Router()
    path = require('path')
    multer = require('multer'),
    {user,task} = require("../model/sch")

const storage = multer.diskStorage({
    //第一步.指定保存到那个目录
    //1.__dirname  //当前文件所在目录  到router
    //2.process.cwd()  当前node 的工作目录  到actul
    destination:path.join(process.cwd(),'public/upload'),
    //第二部.接受到的文件重新命名  防止不同用户上传相同名字的文件
    filename:function(req,file,callback) {
        //console.log(file);
        const h = file.originalname.split('.')
        const filename = `${Date.now()}.${h[h.length-1]}`
        callback(null,filename)
    }    
})

//指定上传文件的类型,只允许了jpg 图片
const filter = function(req,file,callback) {
    //设置这个时  没有明确的允许就是拒绝使用这种文件
    if(file.mineType === 'image/gif'){
        callback(null,true)
    }
}

const upload = multer({
    storage,
    filter
})

router.post('/upload',function(req,res) {
    //前端发送过来的数据有很多，例如名字 密码 截取我们需要的内容
    upload.single('file')(req,res,function(err) {
       // console.log(err);
        if(err){
            return res.send({code:1})
        }
        res.send({code:0,data:{
            src:`/upload/${req.file.filename}`
        }})
    })

})

router.post('/task/all',function(req,res) {
    Promise.all([
     task.find().populate('user').sort({id:-1 }).skip((req.body.page-1)*req.body.limit).limit(Number(req.body.limit)),
     task.countDocuments()
    ]).then(function(data) {
        res.send({code:0,data:data[0],count:data[1]})
    })
 })

 router.post("/task/can",function(req,res) {
     Promise.all([ 
         task.find({can:false}).populate('user').skip((req.body.page-1)*req.body.limit).limit(Number(req.body.limit)),
         task.countDocuments({can:false})
        ]).then(function(data) {
            res.send({code:0,data:data[0],count:data[1]})
        })
 })

 router.post("/task/notcan",function(req,res) {
    Promise.all([ 
        task.find({can:true}).populate('user').skip((req.body.page-1)*req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments({can:true})
       ]).then(function(data) {
           res.send({code:0,data:data[0],count:data[1]})
       })
})

router.post('/task/my',function(req,res) {
    user.findOne({_id:req.session.user._id})
    .populate({
        path:'task.publish',
        options:{
            sort:{_id:-1},
            skip:(req.body.page-1)*req.body.limit,
            limit:Number(req.body.limit)
        }
    })
    .then(function(data) {
        //console.log(data);
        res.send({code:0,data:data.task.publish,count:data.task.publish.length})
    })
})
router.post('/task/a',function(req,res) {
    user.findOne({_id:req.session.user._id})
    .populate({
        path:'task.receive',
        options:{
            sort:{_id:-1},
            skip:(req.body.page-1)*req.body.limit,
            limit:Number(req.body.limit)
        }
    })
    .then(function(data) {
        console.log(data);
        res.send({code:0,data:data.task.receive,count:data.task.receive.length})
    })
})
router.post('/task/b',function(req,res) {
    user.findOne({_id:req.session.user._id})
    .populate({
        path:'task.accomplish',
        options:{
            sort:{_id:-1},
            skip:(req.body.page-1)*req.body.limit,
            limit:Number(req.body.limit)
        }
    })
    .then(function(data) {
        //console.log(data);
        res.send({code:0,data:data.task.accomplish,count:data.task.accomplish.length})
    })
})
module.exports = router;