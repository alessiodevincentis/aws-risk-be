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
/*    personale: [{
        anagrafica: {
            nome: {
                type: String
            },
            cognome: {
                type: String
            },
            codiceFiscale: {
                type: String
            },
            telefono: {
                type: String
            },
            email: {
                type: String
            }
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
        },
    }],
    autonomi: [{
        anagrafica: {
            denominazione: {
                type: String
            },
            codiceFiscale: {
                type: String
            },
            partitaIva: {
                type: String
            },
            telefono: {
                type: String
            },
            email: {
                type: String
            }
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
    }],
    mezzi: [{
        anagrafica: {
            categoria: {
                type: String
            },
            marca: {
                type: String
            },
            modello: {
                type: String
            },
            targa: {
                type: String
            },
            codiceFiscale: {
                type: String
            },
            dataScadenzaRevisione: {
                type: Date
            },
            dataScadenzaRCA: {
                type: Date
            }
        },
        accessori: {
            accessoriList: [{
                nome: {type: String},
                descrizione: {type: String}
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
    }],*/
    dataInserimento: {type: Date},
    dataArchiviazione: {type: Date}
})

const AziendaDb = mongoose.model('AziendaDb', schema, 'azienda');

module.exports = AziendaDb;