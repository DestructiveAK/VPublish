module.exports = (app, mongoose) => {
    const { checkUser } = require('../middlewares/auth');
    const Paper = require('../models/paper.model');
    const multer = require('multer');
    const GridFsStorage = require('multer-gridfs-storage');
    const crypto = require('crypto');
    const path = require('path');
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

    //Create new paper
    app.post('/create',
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
                cover_letter: () => {if (coverLetter) return coverLetter;},
                manuscript: manuscript,
                supplement: () => {if (supplement) return supplement;}
            });
            newPaper.save(err => {
                if (err) {
                    res.render('create', {error: err.message});
                }
            });
            res.redirect('/dashboard');
        });
    });



    app.get('/paper/:filename/view', checkUser, (req, res) => {
        const fileName = req.params.filename;
        res.set('Content-Type', 'application/pdf');
        bucket.openDownloadStreamByName(fileName).
            pipe(res).
            on('error', (err) => {
                console.log(err);
        });
    });


    app.get('/paper/:filename/download', checkUser, (req, res) => {
        const fileName = req.params.filename;
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment');
        bucket.openDownloadStreamByName(fileName)
            .pipe(res)
            .on('error', (err) => {
            console.log(err);
        });
    });
};
