const users = require("../model/userModel");
const jwt = require('jsonwebtoken')
//register
exports.registerController = async (req, res) => {
  const { username, email, password } = req.body
  console.log(username, email, password);
  try {
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      res.status(400).json('Already User Exist')
    } else {
      const newUser = new users({
        username, email, password,
      })
      await newUser.save()//mongodb save
      res.status(200).json(newUser)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

//login
exports.loginController = async (req, res) => {
  const { email, password } = req.body
  console.log(email, password);
  try {
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      if (existingUser.password == password) {
        const token = jwt.sign({ userMail: existingUser.email }, 'secretkey')
        res.status(200).json({ existingUser, token })
      }
      else {
        res.status(401).json('incorrect username or password')
      }
    }
    else {
      res.status(404).json('Account doesnot exist...')
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

//google-login
exports.googleLoginController = async (req, res) => {
  const { username, email, password, photo } = req.body
  console.log(username, email, password, photo);
  try {
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      const token = jwt.sign({ userMail: existingUser.email }, 'secretkey')
      res.status(200).json({ existingUser, token })
    }
    else {
      const newUser = new users({
        username, email, password, profile: photo
      })
      await newUser.save()//mongodb save
      const token = jwt.sign({ userMail: newUser.email }, 'secretkey')
      res.status(200).json({ existingUser: newUser, token })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
//get all users
exports.getAllUsersControllers = async (req, res) => {
  const email = req.payload  // extracted from JWT
  try {
    const allusers = await users.find({ email: { $ne: email } })  // exclude self
    res.status(200).json(allusers)
  } catch (error) {
    res.status(500).json(error)
  }
}
//delete user
// In userController.js
exports.deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    await users.deleteOne({ _id: id });
    res.status(200).json("User deleted successfully");
  } catch (err) {
    res.status(500).json("Failed to delete user");
  }
};


// GET /profile   – return current user’s profile
exports.getProfileController = async (req, res) => {
  const email = req.payload;
  try {
    const user = await users.findOne({ email }, { password: 0 }); // hide pw
    res.json(user);
  } catch (err) {
    res.status(500).json('Profile fetch error');
  }
};

// PUT /profile   – update username / password / bio
exports.updateProfileController = async (req, res) => {
  const email = req.payload;
  const { username, password } = req.body;
  try {
    const updated = await users.findOneAndUpdate(
      { email },
      { $set: { username, password} },
      { new: true, projection: { password: 0 } }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json('Profile update error');
  }
};





