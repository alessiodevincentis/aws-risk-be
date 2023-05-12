const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    nome: {type: String},
    descrizione: {type: String},
    img: {type: String},
    position: {
        lat: {type: Number},
        lng: {type: Number}
    },
    aree: [
        {
            uuid: {type: String},
            nome: {type: String},
            descrizione: {type: String},
            color: {type: String},
            fattoriRischio: [{type: String}],
            x: {type: Number},
            y: {type: Number},
            width: {type: Number},
            height: {type: Number},
            attivitaLavorative: [
                {
                    nome: {type: String},
                    descrizione: {type: String},
                    dataInizioStimata: {type: Date},
                    dataFineStimata: {type: Date},
                    idArea: {type: String}
                }
            ]
        }
    ]
});

const PlanimetriaDb = mongoose.model('PlanimetriaDb', schema, 'planimetria');

module.exports = PlanimetriaDb;