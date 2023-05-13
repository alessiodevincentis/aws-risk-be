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
    idMezzi: [String]
});

const AttivitaLavorativaDb = mongoose.model('AttivitaLavorativaDb', schema, 'attivita_lavorativa');

module.exports = AttivitaLavorativaDb;