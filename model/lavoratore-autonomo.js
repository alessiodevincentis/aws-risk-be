const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    anagrafica: {
        denominazione : {
            type : String,
            required: true
        },
        codiceFiscale : {
            type : String,
            required: true
        },
        partitaIva : {
            type : String,
            required: true
        },
        indirizzo : {
            type : String,
            required: true
        },
        telefono : {
            type : String
        },
        email : {
            type : String
        },
        naturaCompetenza : [
            {
                ateco: {type: String},
                attivitaEsercitata: {type: String}
            }
        ]
    },
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
    },
    dataInserimento: {type: Date},
    dataArchiviazione: {type: Date}
})

const LavoratoreAutonomoDb = mongoose.model('LavoratoreAutonomoDb', schema, 'lavoratore_autonomo');

module.exports = LavoratoreAutonomoDb;