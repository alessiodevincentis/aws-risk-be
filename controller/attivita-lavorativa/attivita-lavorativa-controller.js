const AttivitaLavorativaDb = require('../../model/attivita-lavorativa.js');
const PersonaleDb = require('../../model/personale.js');
const PlanimetriaDb = require('../../model/planimetria.js');
const DittaDb = require('../../model/ditta.js');
const MezzoDb = require('../../model/mezzo.js');

// retrieve and return all attivita
exports.find = (req, res)=>{
    let queryFilter = undefined;
    AttivitaLavorativaDb.find(queryFilter)
        .then(attivita => {
            res.send(attivita)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving attivita information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    AttivitaLavorativaDb.create(req.body.attivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting AttivitaLavorativa" })
        })
}

exports.update = (req, res)=>{
    AttivitaLavorativaDb.findByIdAndUpdate(req.body.attivitaLavorativa._id,req.body.attivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving AttivitaLavorativa" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    AttivitaLavorativaDb.findByIdAndDelete(req.query.idAttivitaLavorativa)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting attivita" })
        })
}

exports.controlli = async (req, res)=>{
    // qui effettuo tutti controlli sull'attività lavorativa e restituisco i risultati in un oggetto
    const attivitaLavorativa = req.body.attivitaLavorativa;
    const controlliList = [];
    if (attivitaLavorativa) {
        const personale = attivitaLavorativa.idDipendenti ?  await PersonaleDb.find({_id: { $in: attivitaLavorativa.idDipendenti } }) : [];
        let aree = [];
        console.log(attivitaLavorativa.idAree)
        const areeAggregation = attivitaLavorativa.idAree ? await PlanimetriaDb.aggregate([
            { $match: { 'aree.uuid': { $in: attivitaLavorativa.idAree } } },
            { $unwind: '$aree' },
            { $match: { 'aree.uuid': { $in: attivitaLavorativa.idAree } } },
            { $project: { _id: 0, area: '$aree' } }
        ]) : []
        if (areeAggregation) {
            aree = areeAggregation.map(item => item.area);
        }

        // 1 - check su fattori rischio dipendenti
        if ((attivitaLavorativa.idDipendenti && attivitaLavorativa.idDipendenti.length > 0) && (attivitaLavorativa.idAree && attivitaLavorativa.idAree.length > 0)) {

            // 1.1 Ciclo i dipendenti
            for (const dip of personale) {
                const docIdoneitaSanitaria = dip.documentazione.documenti.find(doc => doc.descrizione === 'IDONEITA\' SANITARIA');
                if (docIdoneitaSanitaria) {
                    const infoIdoneitaSanitaria = docIdoneitaSanitaria.infoIdoneitaSanitaria;
                    const fattoriRischioDip = infoIdoneitaSanitaria.fattoriRischio;
                    const fattoriRischioAree = [];
                    console.log(aree)
                    aree.forEach(area => {fattoriRischioAree.push(...area.fattoriRischio)});
                    let allFounded = fattoriRischioAree.every((fattoRischioArea) => fattoriRischioDip.includes(fattoRischioArea));
                    if (!allFounded) {
                        const fattoriRischioMancanti = fattoriRischioAree.filter((item) => fattoriRischioDip.indexOf(item) < 0);
                        controlliList.push({level: 'warning',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' non presenta i seguenti fattori di rischio: ' + fattoriRischioMancanti.toString(),icon: 'pi pi-exclamation-triangle',iconClass: 'p-button-warning'});
                    }
                } else {
                    controlliList.push({level: 'danger',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' non presenta il documento di idoneità sanitaria',icon: 'pi pi-exclamation-circle',iconClass: 'p-button-danger'});
                }
            }
        } else {
            if (!(attivitaLavorativa.idDipendenti && attivitaLavorativa.idDipendenti.length > 0)) {
                controlliList.push({level: 'info',type: 'Elementi incompleti',message: 'Non hai selezionato alcun dipendente per l\'attività',icon: 'pi pi-info-circle',iconClass: 'p-button-info'});
            }
            if (!(attivitaLavorativa.idAree && attivitaLavorativa.idAree.length > 0)) {
                controlliList.push({level: 'info',type: 'Elementi incompleti',message: 'Non hai selezionato alcuna area per l\'attività',icon: 'pi pi-info-circle',iconClass: 'p-button-info'});
            }
        }

        // 2 - CHECK SU DOCUMENTAZIONE AZIENDALE, PERSONALE, E MEZZO IN SCADENZA E SCADUTA
        const ditte = attivitaLavorativa.idAziende ?  await DittaDb.find({_id: { $in: attivitaLavorativa.idAziende } }) : [];
        if (ditte && ditte.length > 0) {
            for(const ditta of ditte) {
                if (documentazioneInScadenza(ditta)) {
                    controlliList.push({level: 'warning',type: 'Documentazione',message: 'La ditta ' + ditta.anagrafica.denominazione + ' presenta dei documenti in scadenza',icon: 'pi pi-exclamation-triangle',iconClass: 'p-button-warning'});
                }
                if (documentazioneScaduta(ditta)) {
                    controlliList.push({level: 'danger',type: 'Documentazione',message: 'La ditta ' + ditta.anagrafica.denominazione + ' presenta dei documenti scaduti',icon: 'pi pi-exclamation-circle',iconClass: 'p-button-danger'});
                }
            }
        } else {
            controlliList.push({level: 'info',type: 'Elementi incompleti',message: 'Non hai selezionato alcuna ditta per l\'attività',icon: 'pi pi-info-circle',iconClass: 'p-button-info'});
        }

        if (personale && personale.length > 0) {
            for(const dip of personale) {
                if (documentazioneInScadenza(dip)) {
                    controlliList.push({level: 'warning',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' presenta dei documenti in scadenza',icon: 'pi pi-exclamation-triangle',iconClass: 'p-button-warning'});
                }
                if (documentazioneScaduta(dip)) {
                    controlliList.push({level: 'danger',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' presenta dei documenti scaduti',icon: 'pi pi-exclamation-circle',iconClass: 'p-button-danger'});
                }
            }
        }

        console.log(attivitaLavorativa.idMezzi)
        const mezzi = attivitaLavorativa.idMezzi ? await MezzoDb.find({_id: { $in: attivitaLavorativa.idMezzi } }) : [];
        if (mezzi && mezzi.length > 0) {
            for(const mezzo of mezzi) {
                if (documentazioneInScadenza(mezzo)) {
                    controlliList.push({level: 'warning',type: 'Documentazione',message: 'Il mezzo ' + mezzo.anagrafica.marca + ' ' + mezzo.anagrafica.modello + ' presenta dei documenti in scadenza',icon: 'pi pi-exclamation-triangle',iconClass: 'p-button-warning'});
                }
                if (documentazioneScaduta(mezzo)) {
                    controlliList.push({level: 'danger',type: 'Documentazione',message: 'Il mezzo ' + mezzo.anagrafica.marca + ' ' + mezzo.anagrafica.modello + ' presenta dei documenti scaduti',icon: 'pi pi-exclamation-circle',iconClass: 'p-button-danger'});
                }
            }
        }

        // 3 - CHECK CONTEMPORANEITA ATTIVITA LAVORATIVE DIPENDENTI

        // 4 - CHECK SU CONTRATTI DI COLLABORAZIONE DEI DIPENDENTI
        for (const dip of personale) {
            const docUnilav = dip.documentazione.documenti.find(doc => doc.descrizione === 'UNILAV');
            if (docUnilav) {
                const infoUnilav = docUnilav.infoUnilav;
                console.log(infoUnilav)
                if (infoUnilav && infoUnilav.tipologiaContrattuale === 'DETERMINATO') {
                    if (attivitaLavorativa.dataInizioStimata && attivitaLavorativa.dataFineStimata) {
                        if (!checkIfAttivitaCompatibileConDateDipendente(new Date(attivitaLavorativa.dataInizioStimata),new Date(attivitaLavorativa.dataFineStimata),new Date(infoUnilav.dataInizioRapporto),new Date(infoUnilav.dataFineRapporto))) {
                            controlliList.push({level: 'warning',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' presenta un contratto a tempo determinato ' + '( ' + formatDate(infoUnilav.dataInizioRapporto) + ' - ' + formatDate(infoUnilav.dataFineRapporto) + ')' +' che non è compatibile con le date stimate',icon: 'pi pi-exclamation-triangle',iconClass: 'p-button-warning'});
                        }
                    }
                }

            } else {
                controlliList.push({level: 'danger',type: 'Documentazione',message: 'Il dipendente ' + dip.anagrafica.cognome + ' ' + dip.anagrafica.nome + ' non presenta il documento UNILAV',icon: 'pi pi-exclamation-circle',iconClass: 'p-button-danger'});
            }
        }

        // 5 - CHECK SU NUMERO DI DUVRI O PIANO OPERATIVO PER NUMERO AZIENDE

        // 6 - CHECK SU DATA INIZIO E FINE ATTIVITA PRESENTI
        if (!attivitaLavorativa.dataInizioStimata || !attivitaLavorativa.dataFineStimata) {
            controlliList.push({level: 'info',type: 'Elementi incompleti',message: 'Compilare correttamente le date stimate di inizio e fine dell\'attività',icon: 'pi pi-info-circle',iconClass: 'p-button-info'});
        }
    }
    res.send(controlliList);
}

documentazioneInScadenza = function (obj) {
    let isDocumentazioneInScadenza = false;
    const today = new Date().getTime();
    if (obj.documentazione && obj.documentazione.documenti) {
        const documentiScaduti = obj.documentazione.documenti.filter((doc) => doc.dataScadenza && (Math.floor((new Date(doc.dataScadenza).getTime() - today) / 1000 / 60 / 60 / 24)) >= 0 &&
            (Math.floor((new Date(doc.dataScadenza).getTime() - today) / 1000 / 60 / 60 / 24)) <= 15);
        isDocumentazioneInScadenza = documentiScaduti && documentiScaduti.length > 0;
    }
    return isDocumentazioneInScadenza;
}

documentazioneScaduta = function (obj) {
    let isDocumentazioneScaduta = false;
    const today = new Date().getTime();
    if (obj.documentazione && obj.documentazione.documenti) {
        const documentiScaduti = obj.documentazione.documenti.filter((doc) => doc.dataScadenza && (Math.floor((new Date(doc.dataScadenza).getTime() - today) / 1000 / 60 / 60 / 24)) < 0);
        isDocumentazioneScaduta = documentiScaduti && documentiScaduti.length > 0;
    }
    return isDocumentazioneScaduta;
}
 checkIfAttivitaCompatibileConDateDipendente = function (dataInizioAttivita, dataFineAttivita, dataInizioRapporto, dataFineRapporto) {
    if (dataInizioRapporto.getTime() <= dataInizioAttivita.getTime() && dataFineRapporto.getTime() >= dataFineAttivita.getTime()) {
        return true;
    } else {
        return false;
    }
}
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
}
