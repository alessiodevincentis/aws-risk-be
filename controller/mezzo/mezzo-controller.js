const MezzoDb = require('../../model/mezzo.js')

// retrieve and return all mezzi
exports.find = (req, res)=>{
    let queryFilter = {$and: []};
    if (req.query.idDitte && req.query.idDitte.split(',').length > 0) {
        addFilterDitte(queryFilter,req.query.idDitte.split(','));
    }
    MezzoDb.find(queryFilter.$and.length > 0 ? queryFilter : undefined)
        .then(mezzi => {
            res.send(mezzi)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving mezzi information" })
        })
}

function addFilterDitte(queryFilter,idDitte) {
    queryFilter.$and.push({'anagrafica.idAzienda': {$in: idDitte}})
}

exports.insert = (req, res)=>{
    console.log(req.body)
    MezzoDb.create(req.body.mezzo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting mezzo" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    MezzoDb.findByIdAndUpdate(req.body.mezzo._id,req.body.mezzo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving mezzo" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    MezzoDb.findByIdAndDelete(req.query.idMezzo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting mezzo" })
        })
}