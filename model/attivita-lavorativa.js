const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    nome: {type: String},
    descrizione: {type: String},
    titoloI: Boolean,
    titoloIV: Boolean,
    dataInizioStimata: {type: Date},
    dataFineStimata: {type: Date},
    idAree: [String],
    idAziende: [String],
    idDipendenti: [String],
    idMezzi: [String],
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
    }
});

const AttivitaLavorativaDb = mongoose.model('AttivitaLavorativaDb', schema, 'attivita_lavorativa');

module.exports = AttivitaLavorativaDb;