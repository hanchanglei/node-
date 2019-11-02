const express = require("express"),
    {user,task} = require('../model/sch'),
    crypto = require("crypto"),
    router = express.Router()

router.use(function(req,res,next) {
    if(req.session.login){
       if(req.session.user.level>=10){
           return next()
       }
       return res.send("没有权限")
    }
    res.send("没有登录")
})

router.get("/user",function(req,res) {
    res.render('admin/user',{
        user:req.session.user,
        title:"用户管理"
    })
}).post('/user',function(req,res) {
    // user.find(function(err,data) {
    //     //ui框架 0：成功  1：失败
    //     res.send({code:0,data})
    //从第几个开始查找  查找多少个
    Promise.all([
        user.find().skip((req.body.page-1) * req.body.limit).limit(Number(req.body.limit)),
        user.countDocuments()//总共有多少条数据
    ]).then(function(data) {
        console.log(data);
        res.send({code:0,data:data[0],count:data[1]})
        
    })
    //为了计算几页  总数据/每页显示多少条数据
    //第一页  1   每页显示10个
    //从第几个开始查找计算方式  （1-1）*10 第一页从0开始查找
    //})
})


router.post('/user/reuserlevel',function(req,res) {
    
    user.findOne({_id:req.body.user_id},function(err,data) {
        console.log(data);
        if(data.level>req.session.user.level){
            //如果想要修改的用户权限  > 当前执行还操作的用户  
            console.log(data);
            
           return res.send({code:1,data:'权限不足'})
        } 
    user.updateOne({_id:req.body.user_id},{$set:{used:req.body.used}},function() {
        res.send({code:0,data:'修改成功'})
     })
    })
})

router.post('/user/del',function(req,res) {
  
    if(!req.body._id){
        return res.send({code:1,data:'参数不正确'})
    }
    //1普通用户  2管理员  3超级管理员
    
    user.findOne({_id:req.body._id},function(err,data) {
        if(data.level >= 999){
            return res.send({code:1,data:'不能删除超级管理员'})
        }
        if(data._id === req.session.user._id){
            return res.send({code:1,data:'不能删除自己'})
        }
        //管理员置渐不能互相删除
        if(req.session.user.level < 999 && data.level >= 10){
            return res.send({code:1,data:'不能删除管理员'})
        }
        Promise.all([
        //要将 该用户所关联的文章  任务  等一并删除
            task.deleteMany({author:req.body._id},function() {}),
            user.deleteOne({_id:req.body._id},function() {}),
            task.updateMany({receiver:req.body._id},{$pull:{receiver:req.body._id}})
       ]).then()
    })
})

router.post('/user/adit',function(req,res) {
    console.log(req.body.level);
    
    user.updateOne({_id:req.body._id},{$set: {level:req.body.level}},function(err,data) {
        if(err){
            return res.send('数据库错误')
        }
    })
})

router.get('/task/add',function(req,res) {
    res.render('admin/addtask',{
        title:"发布",
        user:req.session.user
    })
})

router.post('/task/add',function(req,res) {
    const data = req.body;
    data.time = new Date()
    data.author = req.session.user._id;
    task.create(data,function(err,data) {
        if(err){
            return res.send({code:1,data:"数据库错误"})
        }
        user.updateOne({_id:req.session.user._id},{$push:{'task.publish':data._id}},function(){
            res.send({code:0,data:"保存成功"})
        })
    })
})

router.get("/task/all",function(req,res) {
    res.render('admin/deltask',{
        title:'任务管理',
        user:req.session.user
    })
})
router.post('/task/all',function(req,res) {
   Promise.all([
    task.find().populate('user').skip((req.body.page-1)*req.body.limit).limit(Number(req.body.limit)),
    task.countDocuments()
   ]).then(function(data) {
       res.send({code:0,data:data[0],count:data[1]})
   })
})

router.post('/task/del',function(req,res) {
    Promise.all([
        //删除文章 也要删除对应的接收该文章的接取人
        user.updateMany(
            {$or:[{'task.publish':req.body._id},{'task.receive':req.body._id},{'task.accomplish':req.body._id}]},
            {$pull:{'task.publish':req.body._id,'task.receive':req.body._id,'task.accomplish':req.body._id}}
        )
    ]).then()
    
    task.deleteOne({_id:req.body._id})
})
module.exports = router;