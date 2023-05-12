const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    nome: {type: String},
    descrizione: {type: String},
    dataInizioStimata: {type: Date},
    dataFineStimata: {type: Date},
    idArea: {type: String},
    idAziende: [{type: mongoose.Schema.Types.ObjectId}],
    idDipendenti: [{type: String}]
});

const AttivitaLavorativaDb = mongoose.model('AttivitaLavorativaDb', schema, 'attivita_lavorativa');

module.exports = AttivitaLavorativaDb;