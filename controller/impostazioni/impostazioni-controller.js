const ImpostazioniDB = require('../../model/impostazioni.js')
const mongoose = require('mongoose');
const utilService = require('../../util/util-service.js')

// retrieve and return all aziende
exports.find = (req, res)=>{
    ImpostazioniDB.find()
        .then(impostazioni => {
            impostazioni.tipiDocumento = utilService.genericSort(impostazioni[0] && impostazioni[0].tipiDocumento ?
                impostazioni[0].tipiDocumento : [], 'descrizione');
            impostazioni.tipiDocumento = setTipoScadenza(impostazioni.tipiDocumento);
            res.send(impostazioni[0])
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving impostazioni information" })
        })


}

function setTipoScadenza(tipiDocumento) {
    if (tipiDocumento) {
        tipiDocumento.forEach(tipoDoc => {
            if (tipoDoc.nessunaScadenza) {
                tipoDoc.tipoScadenza = 'SEMPRE VALIDO';
            } else if (tipoDoc.scadenzaIndicataDocumento) {
                tipoDoc.tipoScadenza = 'INDICATA SU DOCUMENTO'
            } else if (tipoDoc.scadenzaDaCalcolare) {
                tipoDoc.tipoScadenza = 'PERIODICO'
            } else {
                tipoDoc.tipoScadenza = 'SEMPRE VALIDO';
            }
        })
    }

    return tipiDocumento;
}

exports.save = (req, res)=>{
    const impostazioni = req.body.impostazioni;
    if (!impostazioni._id) {
        impostazioni._id = new mongoose.mongo.ObjectId();
    }
    ImpostazioniDB.findOneAndUpdate({'_id':impostazioni._id},impostazioni, {upsert: true})
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving impostazioni" })
        })
}