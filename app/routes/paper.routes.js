const {checkUser} = require('../helpers/auth');
const Paper = require('../models/paper.model');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const router = require('express').Router();
const dbConfig = require('../../config/database.config');
const mongoose = require('mongoose');
const connection = mongoose.createConnection(dbConfig.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let bucket;
connection.once('open', () => {
    bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: 'files'
    });
});

const deleteFile = require('../helpers/delete_file');

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
        const authorName = req.body.firstname + ' ' + req.body.lastname;
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
                authorName: authorName,
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
        if (paper.manuscript) deleteFile(bucket, paper.manuscript.filename);
        if (paper.cover_letter) deleteFile(bucket, paper.cover_letter.filename);
        if (paper.supplement) deleteFile(bucket, paper.supplement.filename);
        paper.remove();
        res.sendStatus(200);
    });
});


router.get('/:id/edit', checkUser, (req, res) => {
    const paperId = req.params.id;
    Paper.findById(paperId)
        .then((paper) => {
            if (!paper) return res.redirect('/dashboard');
            res.render('create', {
                title: paper.title,
                abstract: paper.abstract,
                keywords: paper.keywords
            });
        })
        .catch((err) => {
            console.error(err);
        })
});


router.post('/:id/edit',
    checkUser,
    upload.fields([
        {name: 'cover-letter', maxCount: 1},
        {name: 'manuscript', maxCount: 1},
        {name: 'supplement', maxCount: 1}]),
    (req, res) => {
        const paperId = req.params.id;
        const abstract = req.body.abstract;
        const keywords = req.body.keywords;
        const coverLetter = (req.files['cover-letter'] !== undefined) ? req.files['cover-letter'][0] : null;
        const manuscript = (req.files['manuscript'] !== undefined) ? req.files['manuscript'][0] : null;
        const supplement = (req.files['supplement'] !== undefined) ? req.files['supplement'][0] : null;
        Paper.findById(paperId)
            .then((paper) => {
                paper.abstract = abstract
                paper.keywords = keywords;
                if (coverLetter) {
                    deleteFile(bucket, paper.cover_letter.filename)
                    paper.cover_letter = coverLetter;
                }
                if (manuscript) {
                    deleteFile(bucket, paper.manuscript.filename);
                    paper.manuscript = manuscript;
                }
                if (supplement) {
                    deleteFile(bucket, paper.supplement.filename);
                    paper.supplement = supplement;
                }
                paper.save();
            }).catch((err) => {
            console.error(err);
        });
        res.redirect('/dashboard');
    })


module.exports = router;
