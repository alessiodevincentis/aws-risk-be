const LavoratoreAutonomoDb = require('../../model/lavoratore-autonomo.js')

// retrieve and return all lavoratoriAutonomi
exports.find = (req, res)=>{
    LavoratoreAutonomoDb.find()
        .then(lavoratoriAutonomi => {
            res.send(lavoratoriAutonomi)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving lavoratoriAutonomi information" })
        })
}

exports.insert = (req, res)=>{
    console.log(req.body)
    LavoratoreAutonomoDb.create(req.body.lavoratoreAutonomo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting lavoratoreAutonomo" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    LavoratoreAutonomoDb.findByIdAndUpdate(req.body.lavoratoreAutonomo._id,req.body.lavoratoreAutonomo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving lavoratoreAutonomo" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    LavoratoreAutonomoDb.findByIdAndDelete(req.query.idLavoratoreAutonomo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting lavoratoreAutonomo" })
        })
}