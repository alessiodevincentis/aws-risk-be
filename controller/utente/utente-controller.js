const UtenteDb = require('../../model/user.js')

// retrieve and return all utente
exports.find = (req, res)=>{
    UtenteDb.find()
        .then(utenti => {
            res.send(utenti)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving utente information" })
        })
}

exports.insert = (req, res)=>{
    console.log(req.body)
    UtenteDb.create(req.body.utente)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting utente" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    UtenteDb.findByIdAndUpdate(req.body.utente._id,req.body.utente)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving utente" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    UtenteDb.findByIdAndDelete(req.query.idUtente)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting utente" })
        })
}