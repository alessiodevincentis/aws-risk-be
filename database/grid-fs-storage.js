let {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: process.env.MONGO_URI, file: (req, file) => {
        return {
            filename: file.originalname
        }
    }
});

module.exports = storage;