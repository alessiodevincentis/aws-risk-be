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
            type : String
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
    responsabiliAddetti: {
        datoreLavoro: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            },
            telefono : {
                type : String
            },
            email : {
                type : String
            },
        },
        rspp: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            },
            telefono : {
                type : String
            },
            email : {
                type : String
            },
        },
        rls: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        },
        medicoCompetente: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        },
        addettiPreposti: [{
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }],
        addettiAntincendioEvacuazione: [{
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }],
        addettiPrimoSoccorso: [{
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }],
        addettiSpaziConfinati: [{
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }],
        addettiLavoriQuota: [{
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }],
        manovratoreGru: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        },
        manovratorePLE: {
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        },
        addettiPesPavPei: [{
            tipo: {
                descrizione: {
                    type: String
                }
            },
            nome : {
                type : String
            },
            cognome : {
                type : String
            }
        }]
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

const DittaDb = mongoose.model('DittaDb', schema, 'ditta');

module.exports = DittaDb;