const mongoose = require('mongoose');

// Definizione dello schema del personale
const personaleSchema = new mongoose.Schema({
    anagrafica: {
        nome: String,
        cognome: String,
        codiceFiscale: String,
        telefono: String,
        email: String,
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
            },
            infoUnilav: {
                lavoroSomministrazione: {type: Boolean},
                lavoroDistacco: {type: Boolean},
                qualificaProfessione: {type: String},
                tipologiaContrattuale: {type: String},
                dataInizioRapporto: {type: Date},
                dataFineRapporto: {type: Date},
            },
            infoIdoneitaSanitaria: {
                mansione: {type: String},
                fattoriRischio: [{type: String}],
                tipologiaVisita: {type: String},
                esitoVisita: {type: String},
                limitazioniIdoneita: {type: String},
                prescrizioniIdoneita: {type: String},
                dataRevisioneVisita: {type: Date}
            }
        }]
    }
});

// Modello del personale
const PersonaleDb = mongoose.model('PersonaleDb', personaleSchema,'personale');

module.exports = PersonaleDb;