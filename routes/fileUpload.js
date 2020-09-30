const router = require('express').Router();
var multer = require('multer');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './img');
    },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload an image.', 400), false);
    }
};

var upload = multer({storage: storage, fileFilter: imageFilter});

// Save the path as image reference

router.post('/single', upload.single('image'), (req, res) => {
    try{
        res.send({file: req.file, user: req.body.username});
    }catch {
        res.send(400)
    }
})

module.exports = router;