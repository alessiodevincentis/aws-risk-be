const express = require('express');
const route = express.Router()
const multer = require('multer');
const storage = require('./../database/grid-fs-storage');
const mongoose = require('mongoose');
let Grid = require('gridfs-stream');

const dittaController = require('../controller/azienda/ditta-controller.js');
const documentoController = require('../controller/documento/documento-controller.js');
const impostazioniController = require('../controller/impostazioni/impostazioni-controller.js');
const duvriController = require('../controller/duvri/duvri-controller.js');
const planimetriaController = require('../controller/planimetria/planimetria-controller.js');
const attivitaLavorativaController = require('../controller/attivita-lavorativa/attivita-lavorativa-controller.js');
const loginController = require('../controller/login/login-controller.js');
const mezzoController = require('../controller/mezzo/mezzo-controller.js');
const personaleController = require('../controller/personale/personale-controller.js');
const utenteController = require('../controller/utente/utente-controller.js');
const lavoratoreAutonomoController = require('../controller/lavoratore_autonomo/lavoratore-autonomo-controller.js');


// API

// LOGIN
route.post('/api/login',loginController.auth);

// DITTA
route.post('/api/ditta', dittaController.insert);
route.put('/api/ditta', dittaController.update);
route.get('/api/ditta', dittaController.find);
route.get('/api/ditta-by-id', dittaController.findById);
route.delete('/api/ditta', dittaController.delete);

// IMPOSTAZIONI
route.post('/api/impostazioni', impostazioniController.save);
route.get('/api/impostazioni', impostazioniController.find);

// DUVRI
route.post('/api/duvri', duvriController.insert);
route.put('/api/duvri', duvriController.update);
route.get('/api/duvri', duvriController.find);
route.delete('/api/duvri', duvriController.delete);

// PLANIMETRIA
route.post('/api/planimetria', planimetriaController.insert);
route.put('/api/planimetria', planimetriaController.update);
route.get('/api/planimetria', planimetriaController.find);
route.delete('/api/planimetria', planimetriaController.delete);

// ATTIVITA LAVORATIVA
route.post('/api/attivita', attivitaLavorativaController.insert);
route.put('/api/attivita', attivitaLavorativaController.update);
route.get('/api/attivita', attivitaLavorativaController.find);
route.delete('/api/attivita', attivitaLavorativaController.delete);
route.post('/api/attivita/controlli', attivitaLavorativaController.controlli);
route.post('/api/attivita/inizia', attivitaLavorativaController.iniziaAttivita);
route.post('/api/attivita/concludi', attivitaLavorativaController.concludiAttivita);

// MEZZO
route.post('/api/mezzo', mezzoController.insert);
route.put('/api/mezzo', mezzoController.update);
route.get('/api/mezzo', mezzoController.find);
route.delete('/api/mezzo', mezzoController.delete);

// LAV AUTONOMO
route.post('/api/lavoratoreAutonomo', lavoratoreAutonomoController.insert);
route.put('/api/lavoratoreAutonomo', lavoratoreAutonomoController.update);
route.get('/api/lavoratoreAutonomo', lavoratoreAutonomoController.find);
route.delete('/api/lavoratoreAutonomo', lavoratoreAutonomoController.delete);

// PERSONALE
route.post('/api/personale', personaleController.insert);
route.put('/api/personale', personaleController.update);
route.get('/api/personale', personaleController.find);
route.delete('/api/personale', personaleController.delete);

// UTENTE
route.post('/api/utente', utenteController.insert);
route.put('/api/utente', utenteController.update);
route.get('/api/utente', utenteController.find);
route.delete('/api/utente', utenteController.delete);

// DOCUMENTO
// Route for file upload
const upload = multer({ storage: storage });
route.post('/api/documento', upload.single('file'),
    function (req,res) {
    res.send({file: req.file})
});
route.get('/api/documento', documentoController.get);

module.exports = route