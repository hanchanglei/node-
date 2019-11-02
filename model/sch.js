const mongoose = require("mongoose");

//定义用户表
const userSchema = new mongoose.Schema({
    username:{type:String,required:'true'},
    password:{type: String},
    used:{type:Boolean,required:'true',default:false},  //账号是否可用
    //普通用户1  管理员10  超级管理员999  一般会相隔较大  方便后期加
    level:{type:Number,required:true,default:10},
    //任务状态
    task :{
        //发布的任务
        publish : {type:[ {type:mongoose.Schema.Types.ObjectId,ref:"task"} ]},
        //已经接受的任务
        receive : {type:[ {type:mongoose.Schema.Types.ObjectId,ref:"task"} ]},
        //已经完成的任务
        accomplish: {type:[ {type:mongoose.Schema.Types.ObjectId,ref : "task"}]}
    }
});

//定义任务表
const taskSchema = new mongoose.Schema({
    title:{type:String},
    content:{type:String},
    author:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    receiver : {type: [{type:mongoose.Schema.Types.ObjectId,ref:"user"}]},
    time : {type:String},
    num: {type:Number}, //接取任务人数限制
    reward:{type:String},//任务奖励
    difficulty:{type:String},//任务难度
    expiration:{type:String},//截止日期
    can:{type:Boolean,default:false},//任务是否已经完成
    msg:{type:[ {
        user:{type:mongoose.Schema.Types.ObjectId},
        msg:{type:String},
        finmsg:{type:Boolean,default:false}//当前用户是否完成任务
    } ]} //用户完成情况
});

const user = mongoose.model('user',userSchema);
const task = mongoose.model('task',taskSchema);

module.exports = {
    user,
    task   
}