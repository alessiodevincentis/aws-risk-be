const mongoose = require('mongoose');

// Definizione dello schema del mezzo
const mezzoSchema = new mongoose.Schema({
    anagrafica: {
        categoria: String,
        marca: String,
        modello: String,
        targaMatricolaSerie: String,
        dataScadenzaRevisione: Date,
        dataScadenzaRCA: Date,
        idAzienda: mongoose.Schema.Types.ObjectId,
        idTipiDocumentoNecessari: [String]
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
    accessori: [
        {nome: String, descrizione: String}
    ]
});

// Modello del mezzo
const MezzoDb = mongoose.model('MezzoDb', mezzoSchema,'mezzo');

module.exports = MezzoDb;