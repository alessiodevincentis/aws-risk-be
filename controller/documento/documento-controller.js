const mongoose = require('mongoose');
const DocumentoDb = require('../../model/documento.js')

exports.get = (req, res)=>{
    DocumentoDb.find({'files_id':new mongoose.Types.ObjectId(req.query.idFile)})
        .then(doc => {
            console.log('FOUND')
            res.send(doc[0])
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditta information" })
        })


}