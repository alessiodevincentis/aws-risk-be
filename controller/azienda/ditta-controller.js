const DittaDb = require('../../model/ditta.js')

// retrieve and return all aziende
exports.find = (req, res)=>{
    let queryFilter = undefined;
    if (req.query.codiceFiscale) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.codiceFiscale'] = {$regex:req.query.codiceFiscale,$options: 'i'}
    }
    if (req.query.partitaIva) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.partitaIva'] = {$regex:req.query.partitaIva,$options: 'i'}
    }
    if (req.query.indirizzo) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.indirizzo'] = {$regex:req.query.indirizzo,$options: 'i'}
    }
    if (!req.query.mostraArchiviate) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['$and'] = [{$or: [{dataArchiviazione:{$eq:null}},{dataArchiviazione: {$exists: false}}]}]
    }
    DittaDb.find(queryFilter)
        .then(ditte => {
            res.send(ditte)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditte information" })
        })
}

exports.findById = (req, res)=>{
    DittaDb.find({'anagrafica.codiceFiscale':req.query.idAzienda})
        .then(ditta => {
            res.send(ditta[0])
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditta information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    DittaDb.create(req.body.ditta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting azienda" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    DittaDb.findByIdAndUpdate(req.body.ditta._id,req.body.ditta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving azienda" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    DittaDb.findByIdAndDelete(req.query.idDitta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting ditta" })
        })
}