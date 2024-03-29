const mongoose = require('mongoose');
const DocumentoDb = require('../../model/documento.js')

exports.get = (req, res)=>{
    DocumentoDb.find({'files_id':new mongoose.Types.ObjectId(req.query.idFile)})
        .then(doc => {
            const returnDoc = {data: mergeBuffers(doc.map(d => d.data))};
            res.send(returnDoc);
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditta information" })
        })


}

function mergeBuffers(buffers) {
    return Buffer.concat(buffers);
}
