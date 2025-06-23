//import multer
const multer = require('multer')
const storage = multer.diskStorage({
    //path to the file
    destination: (req, file, callback) => {
        callback(null, './uploads')  // ⬅️ this works if uploads folder exists
    },
    //name to store the file
    filename:(req,file,callback)=>{
        const fname = `image-${file.originalname}`
        callback(null,fname)
    }
})
const fileFilter = (req,file,callback)=>{
    //accepts only png jpeg jpg
    if (file.mimetype == 'image/png'  || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
        callback(null,true)
    }
    else{
        callback(null,false) 
        return callback(new Error('accept only png,jpg,jpeg files only'))
    }
}
//create Config
const multerConfig = multer({
    storage,
    fileFilter
})

module.exports = multerConfig
