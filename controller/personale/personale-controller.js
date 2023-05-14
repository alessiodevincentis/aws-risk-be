const PersonaleDb = require('../../model/personale.js')

// retrieve and return all personale
exports.find = (req, res)=>{
    PersonaleDb.find()
        .then(personale => {
            res.send(personale)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving personale information" })
        })
}

exports.insert = (req, res)=>{
    console.log(req.body)
    PersonaleDb.create(req.body.personale)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting personale" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    PersonaleDb.findByIdAndUpdate(req.body.personale._id,req.body.personale)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving personale" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    PersonaleDb.findByIdAndDelete(req.query.idPersonale)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting personale" })
        })
}