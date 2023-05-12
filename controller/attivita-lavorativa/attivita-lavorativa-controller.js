const AttivitaLavorativaDb = require('../../model/attivita-lavorativa.js');

// retrieve and return all attivita
exports.find = (req, res)=>{
    let queryFilter = undefined;
    AttivitaLavorativaDb.find(queryFilter)
        .then(attivita => {
            res.send(attivita)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving attivita information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    AttivitaLavorativaDb.create(req.body.attivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting AttivitaLavorativa" })
        })
}

exports.update = (req, res)=>{
    AttivitaLavorativaDb.findByIdAndUpdate(req.body.attivitaLavorativa._id,req.body.attivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving AttivitaLavorativa" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    AttivitaLavorativaDb.findByIdAndDelete(req.query.idAttivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting attivita" })
        })
}