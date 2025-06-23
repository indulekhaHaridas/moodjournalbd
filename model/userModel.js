//import mongoose 
const mongoose = require('mongoose')
// create schema
const usersSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true 
    },
    password:{
         type:String,
        required:true
    },
    profile:{
         type:String,
         default:""
    },
})

const users = mongoose.model("users",usersSchema)


module.exports = users