const { checkUser } = require('../middlewares/auth');
const Paper = require('../models/paper.model');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const router = require('express').Router();
const dbConfig = require('../../config/database.config');
const mongoose = require('mongoose');
mongoose.connect(dbConfig.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database: ", err);
    process.exit();
});

const connection = mongoose.connection;

let bucket;
connection.once('open', ()=> {
    bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: 'files'
    });
});

const storage = new GridFsStorage({
    db: connection,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'files'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({storage});

router.get('/create', checkUser, function (req, res) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('create');
});

//Create new paper
router.post('/create',
    checkUser,
    upload.fields([
        {name: 'cover-letter', maxCount: 1},
        {name: 'manuscript', maxCount: 1},
        {name: 'supplement', maxCount: 1}]),
    function(req, res) {
        const title = req.body.title;
        const abstract = req.body.abstract;
        const keywords = req.body.keywords;
        const authorId = req.body.email;
        const coverLetter = (req.files['cover-letter'] !== undefined) ? req.files['cover-letter'][0] : null;
        const manuscript = req.files['manuscript'][0];
        const supplement = (req.files['supplement'] !== undefined) ? req.files['supplement'][0] : null;
        if (!title || !abstract || !keywords || !manuscript) {
            return res.send("Form incomplete")
        }
        Paper.findOne({title: title}, (err, paper) => {
            if (paper) {
                return res.render('create', {error: "Paper with same title exists"});
            }
            const newPaper = new Paper({
                title: title,
                abstract: abstract,
                keywords: keywords,
                authorId: authorId,
                cover_letter: coverLetter,
                manuscript: manuscript,
                supplement: supplement
            });
            newPaper.save(err => {
                if (err) {
                    res.render('create', {error: err.message});
                }
            });
            res.redirect('/dashboard');
        });
    });



router.get('/:filename/view', checkUser, (req, res) => {
    const fileName = req.params.filename;
    bucket.find({filename: fileName}).toArray((err, file) => {
        res.set({
            'Content-Type': file[0].contentType,
            'Content-Length': `${file[0].length}`,
        });
    });

    bucket.openDownloadStreamByName(fileName).
    pipe(res).
    on('error', (err) => {
        console.log(err);
    });
});


router.get('/:filename/download', checkUser, (req, res) => {
    const fileName = req.params.filename;
    bucket.find({filename: fileName}).toArray((err, file) => {
        res.set({
            'Content-Type': file[0].contentType,
            'Content-Length': `${file[0].length}`,
            'Content-Disposition': 'attachment'
        });
    });

    bucket.openDownloadStreamByName(fileName)
        .pipe(res)
        .on('error', (err) => {
            console.log(err);
        });
});

router.get('/:id/delete', (req, res) => {
    const paperId = req.params.id;
    Paper.findOne({_id: paperId}, (err, paper) => {
        if (!paper) return res.send('Requested operation cannot be processed.')
        const fileNames = [];
        if (paper.manuscript) fileNames.push(paper.manuscript.filename);
        if (paper.cover_letter) fileNames.push(paper.cover_letter.filename);
        if (paper.supplement) fileNames.push(paper.supplement.filename);
        for (let fileName of fileNames) {
            bucket.find({filename: fileName}).toArray((err, file) => {
                bucket.delete(file[0]._id, (err) => {
                    if (err) {
                        console.error(err);
                        return res.sendStatus(400);
                    }
                });
            });
        }
        paper.remove();
        res.sendStatus(200);
    });
});

module.exports = router;
