const MezzoDb = require('../../model/mezzo.js')

// retrieve and return all mezzi
exports.find = (req, res)=>{
    MezzoDb.find()
        .then(mezzi => {
            res.send(mezzi)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving mezzi information" })
        })
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