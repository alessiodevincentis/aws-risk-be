const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    nome: {type: String},
    descrizione: {type: String},
    titoloI: Boolean,
    titoloIV: Boolean,
    dataInizioStimata: {type: Date},
    dataFineStimata: {type: Date},
    dataInizioEffettiva: {type: Date},
    dataFineEffettiva: {type: Date},
    obbligatorietaDuvri: Boolean,
    idAree: [String],
    idAziende: [String],
    idDipendenti: [String],
    idMezzi: [String],
    idTipiDocumentoNecessari: [String],
    documentazione: {
        documenti:[{
            id: {
                type: String
            },
            idTipoDocumento: {
                type: mongoose.Schema.Types.ObjectId
            },
            idStorage: {
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
            },
            dataInserimento: Date,
            note: String,
            isDocumentoRevisione: Boolean,
            isDocumentoSostituzione: Boolean,
            sostituito: Boolean
        }]
    }
});

const AttivitaLavorativaDb = mongoose.model('AttivitaLavorativaDb', schema, 'attivita_lavorativa');

module.exports = AttivitaLavorativaDb;