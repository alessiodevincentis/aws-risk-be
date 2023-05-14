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
            }
        }]
    },
    accessori: [
        {nome: String, descrizione: String}
    ]
});

// Modello del mezzo
const MezzoDb = mongoose.model('MezzoDb', mezzoSchema,'mezzo');

module.exports = MezzoDb;