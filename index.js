//import dotenv files
require('dotenv').config()// load environment variables
//import express library
const express = require('express')

//import cors
const cors = require('cors')

//import route
const route = require('./routes')
//import db connection file
require('./databaseconnection')

//create the server=express()
const moodjournalServer = express()

//server using cors
moodjournalServer.use(cors())
moodjournalServer.use(express.json())//parse the json- middleware
moodjournalServer.use(route)




// create port
PORT = 4000 || process.env.PORT

moodjournalServer.listen(PORT, ()=>{
    console.log(`server running successfully at port number ${PORT}`);
    
})