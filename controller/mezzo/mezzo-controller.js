const MezzoDb = require('../../model/mezzo.js')
const DittaDb = require("../../model/ditta");

// retrieve and return all mezzi
exports.find = (req, res)=>{
    let queryFilter = {$and: []};
    if (req.query.idDitte && req.query.idDitte.split(',').length > 0) {
        addFilterDitte(queryFilter,req.query.idDitte.split(','));
    }
    if (!req.query.mostraDisattivati) {
        addFilterSoloAttivi(queryFilter);
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
function addFilterSoloAttivi(queryFilter) {
    queryFilter.$and.push({$or: [{"anagrafica.disattivato":{$exists:false}},{"anagrafica.disattivato":false},{"anagrafica.disattivato":null}]})
}

exports.insert = async (req, res) => {
    const mezzoResponse = await MezzoDb.find({'anagrafica.targaMatricolaSerie': req.body.mezzo.anagrafica.targaMatricolaSerie});
    if (mezzoResponse && mezzoResponse.length > 0) {
        res.status(400).send({errorCode: '01', message: "Esiste già un mezzo con la targa inserita"})
        return;
    }
    MezzoDb.create(req.body.mezzo)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({message: err.message || "Error Occurred while inserting mezzo"})
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