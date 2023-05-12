const DuvriDb = require('../../model/duvri.js')

// retrieve and return all duvri
exports.find = (req, res)=>{
    DuvriDb.find()
        .then(duvri => {
            res.send(duvri)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving duvri information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    DuvriDb.create(req.body.duvri)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting duvri" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    DuvriDb.findByIdAndUpdate(req.body.duvri._id,req.body.duvri)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving duvri" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    DuvriDb.findByIdAndDelete(req.query.idDuvri)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting duvri" })
        })


}