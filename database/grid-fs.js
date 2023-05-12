const mongoose = require('mongoose');
let Grid = require('gridfs-stream');

let gfs;
const initializeGridFs = async () => {
    try{
        const conn = mongoose.createConnection(process.env.MONGO_URI);
        conn.once('open', () => {
            gfs = Grid(conn.db, mongoose.mongo);
            gfs.collection('uploads');
        });
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = {initializeGridFs:initializeGridFs};