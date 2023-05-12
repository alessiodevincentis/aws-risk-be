const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    anagrafica: {
        richiestaAcquisto: {type: String},
        dataEmissione: {type: Date},
        idAzienda: {type: mongoose.Schema.Types.ObjectId},
        oggetto: {type: String},
        areeIntervento: {type: String},
        dataInizioStimata: {type: Date},
        dataFineStimata: {type: Date},
        firmaCommittente: {type: Boolean},
        firmaAppaltatore: {type: Boolean}
    },
    documentazione: {
        documenti:[{
            id: {
                type: String
            },
            idTipoDocumento: {
                type: mongoose.Schema.Types.ObjectId
            },
            nomeFile: {
                type: String
            },
            descrizione: {
                type: String
            },
            dataScadenza: {
                type: Date
            }
        }]
    },
});

const DuvriDb = mongoose.model('DuvriDb', schema, 'duvri');

module.exports = DuvriDb;