const AziendaDb = require('../../model/azienda.js')

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
    AziendaDb.find(queryFilter)
        .then(aziende => {
            res.send(aziende)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving azienda information" })
        })


}

exports.findById = (req, res)=>{
    AziendaDb.find({'anagrafica.codiceFiscale':req.query.idAzienda})
        .then(azienda => {
            res.send(azienda[0])
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving azienda information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    AziendaDb.create(req.body.azienda)
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
    AziendaDb.findByIdAndUpdate(req.body.azienda._id,req.body.azienda)
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
    AziendaDb.findByIdAndDelete(req.query.idAzienda)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting azienda" })
        })
}