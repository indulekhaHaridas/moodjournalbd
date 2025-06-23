// import the express
const express = require('express')
//import userController
const userController = require('./controllers/userController')
//import moodController
const moodController = require('./controllers/moodController')
//import jwtmiddleware
const jwtMiddleware = require('./middleware/jwtMiddleware')
//import multerConfig
const multerConfig = require('./middleware/imgMulterMiddleware')
// create the instance for the class
const route = new express.Router()

//path for register function
route.post('/register',userController.registerController)
//path to login
route.post('/login',userController.loginController)

//path to google login
route.post('/google-login',userController.googleLoginController)

//path to add moods
route.post('/add-mood',jwtMiddleware,moodController.addMoodController)
//path to get moods
route.get('/all-moods', jwtMiddleware, moodController.getMoodController);

// DELETE a mood (no JWT)
route.delete('/delete-mood/:id', moodController.deleteMoodController);

// UPDATE a mood
route.put('/update-mood/:id', jwtMiddleware, moodController.updateMoodController);
//get all users
route.get('/all-users', jwtMiddleware,userController.getAllUsersControllers);
//to delete users
route.delete('/delete-user/:id', jwtMiddleware, userController.deleteUserController);

//to get all moods
route.get('/admin-all-moods', jwtMiddleware, moodController.getAllMoodEntries);

//to get user mood analysis
route.get('/user-mood-analysis', jwtMiddleware,moodController.userMoodAnalysisController);

// journal statistics – protected by the same jwtMiddleware
route.get('/journals-count',   jwtMiddleware, moodController.journalCountController);
route.get('/average-mood',     jwtMiddleware, moodController.avgMoodController);
route.get('/anomalies-count',  jwtMiddleware, moodController.anomalyCountController);
route.get('/profile',  jwtMiddleware, userController.getProfileController);
route.put('/profile',  jwtMiddleware, userController.updateProfileController);


//routes export
module.exports = route