const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    idStabilimento: {type: mongoose.Schema.Types.ObjectId},
    tipiDocumento: [{
        descrizione: {type: String},
        codice: {type: String},
        competenza: {type: String},
        tipoScadenza: {type: String}, // da appoggio per filtro fe
        nessunaScadenza: {type: Boolean},
        scadenzaIndicataDocumento: {type: Boolean},
        scadenzaDaCalcolare: {type: Boolean},
        mesiValidita: {type: Number},
        fattoriRischio:[String]
    }],
    fattoriRischio:[String]
})

const ImpostazioniDb = mongoose.model('ImpostazioniDb', schema, 'impostazioni');

module.exports = ImpostazioniDb;