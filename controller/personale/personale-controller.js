const PersonaleDb = require('../../model/personale.js')

// retrieve and return all personale
exports.find = (req, res)=>{
    let queryFilter = {$and: []};
    if (req.query.tempoDeterminato) {
        addFilterTempoDeterminato(queryFilter);
    }
    if (req.query.tempoIndeterminato) {
        addFilterTempoIndeterminato(queryFilter);
    }
    if (req.query.idDitte && req.query.idDitte.split(',').length > 0) {
        addFilterDitte(queryFilter,req.query.idDitte.split(','));
    }
    if (req.query.fattoriRischio && req.query.fattoriRischio.split(',').length > 0) {
        addFilterFattoriRischio(queryFilter,req.query.fattoriRischio.split(','));
    }
    if (req.query.note) {
        addFilterNote(queryFilter,req.query.note);
    }
    PersonaleDb.find(queryFilter.$and.length > 0 ? queryFilter : undefined)
        .then(personale => {
            res.send(personale)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving personale information" })
        })
}

function addFilterTempoIndeterminato(queryFilter) {
    queryFilter.$and.push({"documentazione.documenti.infoUnilav.tipologiaContrattuale":"INDETERMINATO"})
}
function addFilterTempoDeterminato(queryFilter) {
    queryFilter.$and.push({"documentazione.documenti.infoUnilav.tipologiaContrattuale":"DETERMINATO"})
}
function addFilterDitte(queryFilter,idDitte) {
    queryFilter.$and.push({'anagrafica.idAzienda': {$in: idDitte}})
}
function addFilterFattoriRischio(queryFilter,fattoriRischio) {
    queryFilter.$and.push({"documentazione.documenti.infoIdoneitaSanitaria.fattoriRischio": {$in: fattoriRischio}})
}
function addFilterNote(queryFilter,note) {
    queryFilter.$and.push({"anagrafica.note": {$regex: note, $options: 'i'}})
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