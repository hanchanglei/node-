const express = require('express'),
    router = express.Router(),
    crypto = require("crypto"),
    {user,task} = require("../model/sch")

/*
    后端自己定义的一些状态码
    0 成功
    1失败
    2服务器错误
*/

router.get('/reg',function(req,res) {
    res.render("reg",{
        login:req.session.login,
        title:'注册页面'
    })
}).post('/reg',function(req,res) {
    //console.log(req.body);
    
    user.findOne({username:req.body.username}).then((data)=>{
        //console.log(data);
        if(data){
            return res.send({
                code:2,
                msg:"用户名已存在"
            })
        }

        //1.指定用什么方式加密  
        const c = crypto.createHash('sha256');
        //2.加密
        const password = c.update(req.body.password).digest('hex')

        user.create({
            username:req.body.username,
            password:password
        }).then(
            (data)=>{
                res.send({code:1,msg:"注册成功"})
            }
        ).catch(function(err) {
            console.log(err);
            
        }).catch(function(err) {
            console.log(err);
            
        })
    })

})


router.get('/login',function(req,res) {
   // console.log(req.session.login);
    
    res.render('login',{
        login:req.session.login,
        title:"登录"
    })
}).post('/login',function(req,res) {
    //1.用户名存不存在
    user.findOne({username:req.body.username},function(err,data) {
        if(data){
            const c = crypto.createHash('sha256');
            const password2 = c.update(req.body.password).digest('hex');
            if(data.password === password2){
                req.session.login = true;
                req.session.user = data
                return res.send({code:0,msg:"登录成功"})
            }
            else{
                return res.send({code:1,msg:"密码错误"})
            }
        }
        res.send({msg:'用户不存在'})
    })
})


router.get('/logout',function(req,res) {
    req.session.destroy()
    res.redirect('/')
})

router.get('/',function(req,res) {
    res.render('index',{
        login:req.session.login,
        user:req.session.user,
        title:"首页"
    })
})

//给所有的路由设置  在想设置的路由前面加
// router.use(function(req,res,next) {
    
// })

//给单一的路由设置
// router.get('/admin',function(req,res,next) {
//     if(req.session.user.level>=10){
//         return next()
//     }
//     res.send("没有权限")
// },function(req,res,next) {
//     res.send('假装这里是后台')
// })

// router.get('')

router.get('/xq/:id',function(req,res) {
    task.findOne({_id:req.params.id}).populate("author receiver").exec(function(err,data) {
        let a = data.receiver.findIndex(function(val) {
            //console.log(val._id);
            //数据类型不一样
            //此步骤  防止同一个人重复接取任务
            //findIndex 数组中存在则返回下标  不存在返回-1
            return String(val._id) === req.session.user._id
        })
        //console.log(a);
        
        res.render('xq',{
            title:"详情页-"+data.title,
            user:req.session.user,
            login:req.session.login,
            data:data,
            a:a
        })
    })
})

router.post('/xq/:id',function(req,res) {
  if(req.session.login){
      return res.send({})
  }
  user.findOne({_id:req.session.user._id},function(err,data) {
      //console.log(data);
      
    //   const a = data.receive.findIndex(function(val) {
    //       return String(val._id) === req.params.id
    //   })
      //根据自己的需求来写判断条件
    //   if(!(a===-1)){
    //     return res.send({})
    //   }
      Promise.all([
        task.updateOne({_id:req.params.id},{$push:{receiver:req.session.user._id}}),
        user.updateOne({_id:req.session.user._id},{$push:{'task.receive':req.params.id}})
      ]).then()
  })
})

router.post('/task/finmsg',function(req,res) {
    task.updateOne({_id:'5db57f3c48ddfa235cce95be'},{$set:{
        ['receiver.'+req.body.index+'.msg']:req.body.msg},
        ['receiver.'+req.body.index+'.finmsg']:true
    }).then()
})
module.exports = router;