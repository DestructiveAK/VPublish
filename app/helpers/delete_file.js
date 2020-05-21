function deleteFile(bucket, fileName) {
    bucket.find({filename: fileName}).toArray((err, file) => {
        if (file.length !== 0) {
            bucket.delete(file[0]._id, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    });
}

module.exports = deleteFile;
