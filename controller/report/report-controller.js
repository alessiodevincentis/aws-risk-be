const ReportDb = require('../../model/report.js')
const ImpostazioniDb = require('../../model/impostazioni.js')
const ExcelJS = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const PDFDocument = require('pdfkit');
const utilService = require("../../util/util-service");
const moment = require('moment');
const PdfPrinter = require('pdfmake');

// retrieve and return all utente
exports.find = (req, res)=>{
    ReportDb.find().sort({dataGenerazione: -1})
        .then(reportGenerati => {
            res.send(reportGenerati)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving report information" })
        })
}

exports.insert = async (req, res) => {
    try {
        const filePath = await createWorkBook(req.body);
        const pdfFilePath = undefined//await createPdfFileFromExcel(filePath);
        const response = await uploadFileToDb(filePath);
        const responsePdf = undefined//await uploadFileToDb(pdfFilePath);
        await createReportDb(response,responsePdf,req.body);
        res.send({status: "ok"});
    } catch (err) {
        console.error(err)
        res.status(500).send({ message : err.message || "Error Occurred while inserting report" })
    }
}

async function createWorkBook(bodyRequest) {
    const tipologiaReport = bodyRequest.tipologia;
    switch (tipologiaReport) {
        case 'REP-DITTA':
            return createWorkBookDitta(bodyRequest);
        case 'REP-MEZZI':
            return createWorkBookMezzi(bodyRequest);
        case 'REP-DIPENDENTI':
            return createWorkBookDipendenti(bodyRequest);
        case 'REP-DIP':
            bodyRequest.idDipendenti = [bodyRequest.idDipendente]
            return createWorkBookDipendenti(bodyRequest);
        case 'REP-ATTIVITA':
            return createWorkBookAttivita(bodyRequest);
    }
}

async function createWorkBookMezzi(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    let ditte = undefined;
    const ditteResponse = await axios.get('http://localhost:8080/api/ditta');
    ditte = ditteResponse && ditteResponse.data ? ditteResponse.data : [];
    if (bodyRequest.idDitte && bodyRequest.idDitte.length > 0) {
        ditte = ditte.filter(ditta => bodyRequest.idDitte.includes(ditta._id));
    }
    const worksheet = workbook.addWorksheet('Mezzi');
    const tipiDocumentoMezziImpostazioni = await getTipiDocumentoFromImpostazioni('MEZZO');
    await scriviMezziDitta(worksheet,ditte,tipiDocumentoMezziImpostazioni);
    const excelFilePath = 'uploads/'+ bodyRequest.tipologia + '-' + (new Date().getTime()) + '.xlsx';
    setColumnsWidth(worksheet);
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}

async function createWorkBookDipendenti(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    let ditte = undefined;
    const ditteResponse = await axios.get('http://localhost:8080/api/ditta');
    ditte = ditteResponse && ditteResponse.data ? ditteResponse.data : [];
    if (bodyRequest.idDitte && bodyRequest.idDitte.length > 0) {
        ditte = ditte.filter(ditta => bodyRequest.idDitte.includes(ditta._id));
    }
    const worksheet = workbook.addWorksheet('Lavoratori');
    const tipiDocumentoDipendentiImpostazioni = await getTipiDocumentoFromImpostazioni('PERSONALE');
    await scriviDipendentiDitta(worksheet,ditte,tipiDocumentoDipendentiImpostazioni,bodyRequest);
    let excelFilePath = 'uploads/'+ bodyRequest.tipologia + '-' + (new Date().getTime()) + '.xlsx';
    setColumnsWidth(worksheet);
    if (bodyRequest.tipologia === 'REP-DIP') { // vuol dire che mi trovo nel tipo report dip singolo
        makeWorksheetVertical(worksheet,workbook);
        excelFilePath = 'uploads/'+ bodyRequest.tipologia + '-' + (worksheet.getRow(2).getCell(1).value).replaceAll(' ','') + '-'+ (worksheet.getRow(2).getCell(2).value).replaceAll(' ','') + '-'+ (new Date().getTime()) + '.xlsx';
    }
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}

function makeWorksheetVertical(worksheet,workbook) {
    const newWorksheet = workbook.addWorksheet('Dipendente');
    const headerRow = worksheet.getRow(1);
    const valueRow = worksheet.getRow(2);
    headerRow.eachCell((cell,colNumber) => {
        const newRow = newWorksheet.addRow([cell.value,valueRow.getCell(colNumber).value]);
        const newCellHeader = newRow.getCell(1);
        const newCellValue = newRow.getCell(2);
        newCellHeader.fill = cell.fill;
        newCellHeader.font = cell.font;
        newCellValue.font = valueRow.getCell(colNumber).font;
        newCellValue.fill = valueRow.getCell(colNumber).fill;
    });
    workbook.removeWorksheet(1);
}

async function createWorkBookAttivita(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    const attivitaResponse = await axios.get('http://localhost:8080/api/attivita',{params: getParamsQueryAttivita(bodyRequest)});
    const ditteResponse = await axios.get('http://localhost:8080/api/ditta');
    const planimetrieResponse = await axios.get('http://localhost:8080/api/planimetria');
    const dipResponse = await axios.get('http://localhost:8080/api/personale',{params: {idDitte: bodyRequest && bodyRequest.idAppaltatori ? bodyRequest.idAppaltatori.join(',') : undefined}});
    const mezziResponse = await axios.get('http://localhost:8080/api/mezzo',{params: {idDitte: bodyRequest && bodyRequest.idAppaltatori ? bodyRequest.idAppaltatori.join(',') : undefined}});
    const attivita = attivitaResponse && attivitaResponse.data ? attivitaResponse.data : [];
    const worksheet = workbook.addWorksheet('Attività programmate');
    let rowData = ['Nome','Descrizione','Titolo','Data inizio stimata','Data fine stimata','Data inizio effettiva','Data fine effettiva','Aree','Appaltatori','Lavoratori','Mezzi'];
    const tipiDocumentoAttivitaImpostazioni = await getTipiDocumentoFromImpostazioni('ATTIVITA LAVORATIVA');
    if (tipiDocumentoAttivitaImpostazioni) {
        rowData.push(...tipiDocumentoAttivitaImpostazioni.map(tipoDoc => tipoDoc.descrizione));
    }
    const rowHeader = worksheet.addRow(rowData);
    rowHeader.fill = {pattern: 'solid',type: 'pattern',fgColor: {argb: 'f3f8ff'}}
    rowHeader.font = {bold: true}
    attivita.forEach(function (att, i) {
        const rowAttivita = worksheet.addRow([att.nome,att.descrizione,att.titoloI ? 'TITOLO I' : 'TITOLO IV',
            att.dataInizioStimata ? moment(att.dataInizioStimata).format('DD/MM/YYYY') : '-',
            att.dataFineStimata ? moment(att.dataFineStimata).format('DD/MM/YYYY') : '-',
            att.dataInizioEffettiva ? moment(att.dataInizioEffettiva).format('DD/MM/YYYY') : '-',
            att.dataFineEffettiva ? moment(att.dataFineEffettiva).format('DD/MM/YYYY') : '-',
            getNomiAreeAttivita(att,planimetrieResponse && planimetrieResponse.data ? planimetrieResponse.data : []),
            getNomiDitteAttivita(att,ditteResponse && ditteResponse.data ? ditteResponse.data : []),
            getNomiLavoratoriAttivita(att,dipResponse && dipResponse.data ? dipResponse.data : []),
            getNomiMezziAttivita(att,mezziResponse && mezziResponse.data ? mezziResponse.data : [])]);
        tipiDocumentoAttivitaImpostazioni.forEach(function (tipoDoc, i) {
            const cellDoc = rowAttivita.getCell(i +11);
            const documentoAtt = att.documentazione ? att.documentazione.documenti.filter(doc => !doc.sostituito).find(doc => doc.idTipoDocumento === tipoDoc._id.toString()) : undefined;
            scriviScadenzaDocumento(documentoAtt,cellDoc,att.idTipiDocumentoNecessari,tipoDoc._id.toString())
        });
    })
    const excelFilePath = 'uploads/'+ bodyRequest.tipologia +'-'+ '-' + (new Date().getTime()) + '.xlsx';
    setColumnsWidth(worksheet);
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}
function getNomiAreeAttivita(att,planimetrie) {
    if (att.idAree && att.idAree.length > 0) {
        let aree = [];
        if (planimetrie) {
            planimetrie.forEach(plan => aree.push(...(plan.aree ? plan.aree : [])))
        }
        return aree.filter(area => att.idAree.includes(area.uuid)).map(area => area.nome).join(',')
    }
    return '-';
}
function getNomiDitteAttivita(att,ditte) {
    if (att.idAziende && att.idAziende.length > 0) {
        return ditte.filter(ditta => att.idAziende.includes(ditta._id)).map(ditta => ditta.anagrafica.denominazione).join(',')
    }
    return '-';
}
function getNomiLavoratoriAttivita(att,lavoratori) {
    if (att.idDipendenti && att.idDipendenti.length > 0) {
        return lavoratori.filter(lav => att.idDipendenti.includes(lav._id)).map(lav => lav.anagrafica.cognome + ' ' + lav.anagrafica.nome).join(',')
    }
    return '-';
}
function getNomiMezziAttivita(att,mezzi) {
    if (att.idMezzi && att.idMezzi.length > 0) {
        return mezzi.filter(mezzo => att.idMezzi.includes(mezzo._id)).map(mezzo => mezzo.anagrafica.categoria + ' ' + mezzo.anagrafica.marca + ' ' +mezzo.anagrafica.modello).join(',')
    }
    return '-';
}
function getParamsQueryAttivita(bodyRequest) {
    const filtroAttivita = bodyRequest.filtroAttivita;
    let queryParameters = {};
    if (filtroAttivita && filtroAttivita.dataAttivita) {
        queryParameters.dataAttivita = filtroAttivita.dataAttivita.toString();
    }
    if (filtroAttivita && filtroAttivita.dataInizioAttivita) {
        queryParameters.dataInizioAttivita = filtroAttivita.dataInizioAttivita.toString();
    }
    if (filtroAttivita && filtroAttivita.dataFineAttivita) {
        queryParameters.dataFineAttivita = filtroAttivita.dataFineAttivita.toString()
    }
    if (filtroAttivita && filtroAttivita.titoloI) {
        queryParameters.titoloI = filtroAttivita.titoloI;
    }
    if (filtroAttivita && filtroAttivita.titoloIV) {
        queryParameters.titoloIV = filtroAttivita.titoloIV;
    }
    if (filtroAttivita && filtroAttivita.idAppaltatori && filtroAttivita.idAppaltatori.length > 0) {
        queryParameters.idAppaltatori = filtroAttivita.idAppaltatori.toString();
    }
    if (filtroAttivita && filtroAttivita.idMezzi && filtroAttivita.idMezzi.length > 0) {
        queryParameters.idMezzi = filtroAttivita.idMezzi.toString();
    }
    if (filtroAttivita && filtroAttivita.idDipendenti && filtroAttivita.idDipendenti.length > 0) {
        queryParameters.idDipendenti = filtroAttivita.idDipendenti.toString();
    }
    return queryParameters;
}

async function createWorkBookDitta(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    const ditta = bodyRequest.ditta;
    const worksheet = workbook.addWorksheet(ditta.anagrafica.denominazione.toUpperCase());
    addTitleDitta(worksheet,ditta);
    const tipiDocumentoDittaImpostazioni = await getTipiDocumentoFromImpostazioni('AZIENDA');
    addDocumentazioneDitta(worksheet,ditta,tipiDocumentoDittaImpostazioni);
    const tipiDocumentoDipendentiImpostazioni = await getTipiDocumentoFromImpostazioni('PERSONALE');
    await addDipendentiDitta(worksheet,ditta,tipiDocumentoDipendentiImpostazioni,bodyRequest);
    addAddettiResponsabili(worksheet,ditta);
    const tipiDocumentoMezziImpostazioni = await getTipiDocumentoFromImpostazioni('MEZZO');
    await addMezziDitta(worksheet,ditta,tipiDocumentoMezziImpostazioni);
    const excelFilePath = 'uploads/'+ bodyRequest.tipologia +'-' + ditta.anagrafica.denominazione.toUpperCase().replaceAll(/\s/g,'') + '-' + (new Date().getTime()) + '.xlsx';
    setColumnsWidth(worksheet);
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}

function setColumnsWidth(worksheet) {
    worksheet.columns.forEach((column, index) => {
        column.width = 19;  // Aggiungi spazio per una maggiore leggibilità
    });
}

async function addMezziDitta(worksheet,ditta,tipiDocumentoMezziImpostazioni) {
    addTitle(worksheet,'Mezzi');
    await scriviMezziDitta(worksheet,[ditta],tipiDocumentoMezziImpostazioni);
}

function addAddettiResponsabili(worksheet,ditta) {
    addTitle(worksheet,'Addetti e responsabili');
    scriviAddettiResponsabili(worksheet,ditta);
}

function scriviAddettiResponsabili(worksheet,ditta) {
    const rowHeader = worksheet.addRow(['Ruolo','Cognome','Nome','Email','Telefono']);
    rowHeader.fill = {pattern: 'solid',type: 'pattern',fgColor: {argb: 'f3f8ff'}}
    rowHeader.font = {bold: true}
    const responsabiliAddetti = ditta.responsabiliAddetti;
    if (responsabiliAddetti) {
        const datoreLavoro = responsabiliAddetti.datoreLavoro;
        const rowDataDatoreLavoro = datoreLavoro ? ['Datore di lavoro',datoreLavoro.cognome,datoreLavoro.nome,datoreLavoro.email,datoreLavoro.telefono] : ['Datore di lavoro','NON INSERITO'];
        worksheet.addRow(rowDataDatoreLavoro);

        const rspp = responsabiliAddetti.rspp;
        const rowDataRspp = rspp ? ['RSPP',rspp.cognome,rspp.nome,rspp.email,rspp.telefono] : ['RSPP','NON INSERITO'];
        worksheet.addRow(rowDataRspp);

        const rls = responsabiliAddetti.rls;
        const rowDataRls = rls ? ['RLS',rls.cognome,rls.nome,rls.email,rls.telefono] : ['RLS','NON INSERITO'];
        worksheet.addRow(rowDataRls);

        const addettiPreposti = responsabiliAddetti.addettiPreposti;
        if (addettiPreposti && addettiPreposti.length > 0) {
            addettiPreposti.forEach(addetto => {
                const rowData = ['ADDETTO PREPOSTO',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI PREPOSTI','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const addettiAntincendioEvacuazione = responsabiliAddetti.addettiAntincendioEvacuazione;
        if (addettiAntincendioEvacuazione && addettiAntincendioEvacuazione.length > 0) {
            addettiAntincendioEvacuazione.forEach(addetto => {
                const rowData = ['ADDETTO ANTINCENDIO EVACUAZIONE',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI ANTINCENDIO EVACUAZIONE','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const addettiPrimoSoccorso = responsabiliAddetti.addettiPrimoSoccorso;
        if (addettiPrimoSoccorso && addettiPrimoSoccorso.length > 0) {
            addettiPrimoSoccorso.forEach(addetto => {
                const rowData = ['ADDETTO PRIMO SOCCORSO',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI PRIMO SOCCORSO','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const addettiSpaziConfinati = responsabiliAddetti.addettiSpaziConfinati;
        if (addettiSpaziConfinati && addettiSpaziConfinati.length > 0) {
            addettiSpaziConfinati.forEach(addetto => {
                const rowData = ['ADDETTO SPAZI CONFINATI',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI SPAZI CONFINATI','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const addettiLavoriQuota = responsabiliAddetti.addettiLavoriQuota;
        if (addettiLavoriQuota && addettiLavoriQuota.length > 0) {
            addettiLavoriQuota.forEach(addetto => {
                const rowData = ['ADDETTO LAVORI IN QUOTA',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI LAVORI IN QUOTA','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const addettiPesPavPei = responsabiliAddetti.addettiPesPavPei;
        if (addettiPesPavPei && addettiPesPavPei.length > 0) {
            addettiPesPavPei.forEach(addetto => {
                const rowData = ['ADDETTO PES PAV PEI',addetto.cognome,addetto.nome];
                worksheet.addRow(rowData);
            })
        } else {
            const rowData = ['ADDETTI PES PAV PEI','NON INSERITI'];
            worksheet.addRow(rowData);
        }

        const manovratoreGru = responsabiliAddetti.manovratoreGru;
        const rowDataManovratoreGru = manovratoreGru ? ['Manovratore Gru',manovratoreGru.cognome,manovratoreGru.nome,manovratoreGru.email,manovratoreGru.telefono] : ['Manovratore Gru','NON INSERITO'];
        worksheet.addRow(rowDataManovratoreGru);

        const manovratorePLE = responsabiliAddetti.manovratorePLE;
        const rowDataManovratorePLE = manovratorePLE ? ['Manovratore PLE',manovratorePLE.cognome,manovratorePLE.nome,manovratorePLE.email,manovratorePLE.telefono] : ['Manovratore PLE','NON INSERITO'];
        worksheet.addRow(rowDataManovratorePLE);

        const medicoCompetente = responsabiliAddetti.medicoCompetente;
        const rowDataMedicoCompetente = medicoCompetente ? ['Medico competente',medicoCompetente.cognome,medicoCompetente.nome,medicoCompetente.email,medicoCompetente.telefono] : ['Medico competente','NON INSERITO'];
        worksheet.addRow(rowDataMedicoCompetente);
    }
}

async function addDipendentiDitta(worksheet,ditta,tipiDocumentoDipendentiImpostazioni,bodyRequest) {
    addTitle(worksheet,'Lavoratori');
    await scriviDipendentiDitta(worksheet,[ditta],tipiDocumentoDipendentiImpostazioni,bodyRequest);
}

async function scriviDipendentiDitta(worksheet,ditte,tipiDocumentoDipendentiImpostazioni,bodyRequest) {
    let rowData = ['Cognome','Nome','Codice fiscale','Ditta','Tipo rapporto'];
    if (tipiDocumentoDipendentiImpostazioni) {
        rowData.push(...tipiDocumentoDipendentiImpostazioni.map(tipoDoc => tipoDoc.descrizione));
    }
    const rowHeader = worksheet.addRow(rowData);
    rowHeader.fill = {pattern: 'solid',type: 'pattern',fgColor: {argb: 'f3f8ff'}}
    rowHeader.font = {bold: true}
    let responseDipendentiDitta = await axios.get('http://localhost:8080/api/personale',{params: {idDitte: ditte ? ditte.map(ditta => ditta._id).join(',') : undefined}});
    responseDipendentiDitta = filtraDipendentiByFilter(responseDipendentiDitta,bodyRequest)
    if (responseDipendentiDitta && responseDipendentiDitta.data.length > 0) {
        responseDipendentiDitta.data.forEach(function (dip, i) {
          const dittaDip = ditte ? ditte.find(dit => dit._id === dip.anagrafica.idAzienda.toString()) : undefined;
          const rowDipendente = worksheet.addRow([dip.anagrafica.cognome,dip.anagrafica.nome,dip.anagrafica.codiceFiscale, dittaDip ? dittaDip.anagrafica.denominazione : '-']);
          addTipoRapportoDip(rowDipendente,dip);
          tipiDocumentoDipendentiImpostazioni.forEach(function (tipoDoc, i) {
              const cellDoc = rowDipendente.getCell(i +6);
              const documentoDip = dip.documentazione ? dip.documentazione.documenti.filter(doc => !doc.sostituito).find(doc => doc.idTipoDocumento === tipoDoc._id.toString()) : undefined;
              scriviScadenzaDocumento(documentoDip,cellDoc,dip.anagrafica.idTipiDocumentoNecessari,tipoDoc._id.toString())
          });
        })
    }
}

function filtraDipendentiByFilter(responseDipendentiDitta,bodyRequest) {
    if (responseDipendentiDitta && responseDipendentiDitta.data.length > 0) {
        if (bodyRequest && bodyRequest.tipiDocumentoDipendentiNonValidi && bodyRequest.tipiDocumentoDipendentiNonValidi.length > 0) {
            filtraDipendentiByTipiDocNonValidi(responseDipendentiDitta,bodyRequest);
        }
        if (bodyRequest && bodyRequest.tipiDocumentoDipendentiValidi && bodyRequest.tipiDocumentoDipendentiValidi.length > 0) {
            filtraDipendentiByTipiDocValidi(responseDipendentiDitta,bodyRequest);
        }
        if (bodyRequest && bodyRequest.tipologiaContrattuale) {
            filtraDipendentiByTipologiaContrattuale(responseDipendentiDitta,bodyRequest);
        }
        if (bodyRequest && bodyRequest.idDipendenti && bodyRequest.idDipendenti.length > 0) {
            filtraDipendentiById(responseDipendentiDitta,bodyRequest);
        }
    }
    return responseDipendentiDitta;
}

function filtraDipendentiById(responseDipendentiDitta,bodyRequest) {
    const idDipendenti = bodyRequest.idDipendenti;
    responseDipendentiDitta.data = responseDipendentiDitta.data.filter(dip => idDipendenti.includes(dip._id));
}

function filtraDipendentiByTipologiaContrattuale(responseDipendentiDitta,bodyRequest) {
    responseDipendentiDitta.data = responseDipendentiDitta.data.filter(dip => {
        const docUnilav = dip.documentazione ? dip.documentazione.documenti.find(doc => doc.descrizione === 'UNILAV') : undefined;
        if (docUnilav) {
            if (bodyRequest.mostraTempoDeterminatoScaduti) {
                return docUnilav.infoUnilav.tipologiaContrattuale === bodyRequest.tipologiaContrattuale && new Date().getTime() > new Date(docUnilav.infoUnilav.dataFineRapporto).getTime();
            } else {
                return docUnilav.infoUnilav.tipologiaContrattuale === bodyRequest.tipologiaContrattuale;
            }
        } else {
            return false;
        }
    })
}

function filtraDipendentiByTipiDocValidi(responseDipendentiDitta,bodyRequest) {
    responseDipendentiDitta.data = responseDipendentiDitta.data.filter(dip => {
        if (dip.documentazione && dip.documentazione.documenti) {
            const idDocumentiNonValidi = getIdTipoDocumentiNonValidi(dip.documentazione.documenti,bodyRequest.tipiDocumentoDipendentiValidi);
            const idDocumentiNonPresenti = getIdTipoDocumentiNonPresenti(dip.documentazione.documenti,bodyRequest.tipiDocumentoDipendentiValidi);
            return !(idDocumentiNonValidi && idDocumentiNonValidi.length > 0) && !(idDocumentiNonPresenti && idDocumentiNonPresenti.length > 0);
        } else {
            return true;
        }
    })
}

function filtraDipendentiByTipiDocNonValidi(responseDipendentiDitta,bodyRequest) {
    responseDipendentiDitta.data = responseDipendentiDitta.data.filter(dip => {
        if (dip.documentazione && dip.documentazione.documenti) {
            const idDocumentiNonValidi = getIdTipoDocumentiNonValidi(dip.documentazione.documenti,bodyRequest.tipiDocumentoDipendentiNonValidi);
            const idDocumentiNonPresenti = getIdTipoDocumentiNonPresenti(dip.documentazione.documenti,bodyRequest.tipiDocumentoDipendentiNonValidi);
            return (idDocumentiNonValidi && idDocumentiNonValidi.length > 0) || (idDocumentiNonPresenti && idDocumentiNonPresenti.length > 0);
        } else {
            return true;
        }
    })
}

function getIdTipoDocumentiNonValidi(documenti,tipiDocumentoDipendentiNonValidi) {
    const idTipiDocFilter = tipiDocumentoDipendentiNonValidi.map(tipoDoc => tipoDoc._id.toString());
    const idTipoDocScaduti = documenti.filter(doc => idTipiDocFilter.includes(doc.idTipoDocumento) && doc.dataScadenza && new Date().getTime() > new Date(doc.dataScadenza).getTime()).map(doc => doc.idTipoDocumento);
    return idTipoDocScaduti;
}

function getIdTipoDocumentiNonPresenti(documenti,tipiDocumentoDipendentiNonValidi) {
    const idTipiDocDipendenti = documenti.map(doc => doc.idTipoDocumento);
    const idTipoDocNonPresenti = tipiDocumentoDipendentiNonValidi.filter(tipoDoc => !idTipiDocDipendenti.includes(tipoDoc._id.toString())).map(tipoDoc => tipoDoc._id.toString());
    return idTipoDocNonPresenti;
}

async function scriviMezziDitta(worksheet,ditte,tipiDocumentoMezziImpostazioni) {
    let rowData = ['Categoria','Marca','Modello','Targa Matricola Serie','Ditta'];
    if (tipiDocumentoMezziImpostazioni) {
        rowData.push(...tipiDocumentoMezziImpostazioni.map(tipoDoc => tipoDoc.descrizione));
    }
    const rowHeader = worksheet.addRow(rowData);
    rowHeader.fill = {pattern: 'solid',type: 'pattern',fgColor: {argb: 'f3f8ff'}}
    rowHeader.font = {bold: true}
    const responseMezziDitta = await axios.get('http://localhost:8080/api/mezzo',{params: {idDitte: ditte ? ditte.map(ditta => ditta._id).join(',') : undefined}});
    if (responseMezziDitta && responseMezziDitta.data.length > 0) {
        responseMezziDitta.data.forEach(function (mezzo, i) {
            const dittaMezzo = ditte ? ditte.find(dit => dit._id === mezzo.anagrafica.idAzienda.toString()) : undefined;
            const rowMezzo = worksheet.addRow([mezzo.anagrafica.categoria,mezzo.anagrafica.marca,mezzo.anagrafica.modello,mezzo.anagrafica.targaMatricolaSerie,dittaMezzo ? dittaMezzo.anagrafica.denominazione : '-']);
            tipiDocumentoMezziImpostazioni.forEach(function (tipoDoc, i) {
                const cellDoc = rowMezzo.getCell(i +6);
                const documentoMezzo = mezzo.documentazione ? mezzo.documentazione.documenti.filter(doc => !doc.sostituito).find(doc => doc.idTipoDocumento === tipoDoc._id.toString()) : undefined;
                scriviScadenzaDocumento(documentoMezzo,cellDoc,mezzo.anagrafica.idTipiDocumentoNecessari,tipoDoc._id.toString())
            });
        })
    }
}

function addTipoRapportoDip(rowDipendente,dip) {
    const documenti = dip.documentazione ? dip.documentazione.documenti : [];
    const unilav = documenti.find(doc => doc.descrizione === 'UNILAV');
    const cellTipoRapporto = rowDipendente.getCell(5);
    if (unilav) {
        const tipologiaContrattuale = unilav.infoUnilav.tipologiaContrattuale;
        if (tipologiaContrattuale === 'INDETERMINATO') {
            cellTipoRapporto.value = 'INDETERMINATO';
            cellTipoRapporto.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: '28a745' }}
            cellTipoRapporto.font = {color: {argb: 'ffffff'}}
        }
        if (tipologiaContrattuale === 'DETERMINATO') {
            const scadenzaContratto = unilav.infoUnilav.dataFineRapporto;
            cellTipoRapporto.value = scadenzaContratto ? moment(scadenzaContratto).format('DD/MM/YYYY') : '-';
            const isContrattoScaduto = new Date().getTime() > new Date(scadenzaContratto).getTime();
            cellTipoRapporto.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: isContrattoScaduto ? 'dc3545' : '28a745' }}
            cellTipoRapporto.font = {color: {argb: 'ffffff'}}
        }
    } else {
        cellTipoRapporto.value = '-';
    }

}

async function getTipiDocumentoFromImpostazioni(competenza) {
    const impostazioni = await ImpostazioniDb.find().exec();
    impostazioni.tipiDocumento = utilService.genericSort(impostazioni[0] && impostazioni[0].tipiDocumento ?
        impostazioni[0].tipiDocumento.filter(tipoDoc => tipoDoc.competenza === competenza) : [], 'descrizione');
    impostazioni.tipiDocumento = setTipoScadenza(impostazioni.tipiDocumento);
    return impostazioni.tipiDocumento;
}

function setTipoScadenza(tipiDocumento) {
    if (tipiDocumento) {
        tipiDocumento.forEach(tipoDoc => {
            if (tipoDoc.nessunaScadenza) {
                tipoDoc.tipoScadenza = 'SEMPRE VALIDO';
            } else if (tipoDoc.scadenzaIndicataDocumento) {
                tipoDoc.tipoScadenza = 'INDICATA SU DOCUMENTO'
            } else if (tipoDoc.scadenzaDaCalcolare) {
                tipoDoc.tipoScadenza = 'PERIODICO'
            } else {
                tipoDoc.tipoScadenza = 'SEMPRE VALIDO';
            }
            console.log(tipoDoc)
        })
    }

    return tipiDocumento;
}

function addDocumentazioneDitta(worksheet,ditta,tipiDocumentoImpostazioni){
    addTitle(worksheet,'Documentazione');
    const documentiDitta = ditta.documentazione ? ditta.documentazione.documenti : [];
    if (tipiDocumentoImpostazioni && tipiDocumentoImpostazioni.length > 0) {
        const rowDescrizioneDocumenti = worksheet.addRow(['']);
        const rowContenutiDocumenti = worksheet.addRow(['']);
        scriviDocumentiDitta(worksheet,documentiDitta,tipiDocumentoImpostazioni,rowDescrizioneDocumenti,rowContenutiDocumenti,ditta)
    }
}

function addTitle(worksheet,title) {
    const row = worksheet.addRow([title]);
    row.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: '97c1fe' }}
    row.alignment = { vertical: 'middle' };
    row.font = { bold: true, size: 12 };
    row.height = 30;
}

function scriviDocumentiDitta(worksheet,documentiDitta,tipiDocumentoImpostazioni,rowDescrizioneDocumenti,rowContenutiDocumenti,ditta) {
    tipiDocumentoImpostazioni.forEach(function (tipoDoc, i) {
        const documentoCaricato = documentiDitta.filter(doc => !doc.sostituito).find(doc => doc.idTipoDocumento === tipoDoc._id.toString());
        const cellDescrizioneDoc = rowDescrizioneDocumenti.getCell(i +1);
        cellDescrizioneDoc.fill = {pattern: 'solid',type: 'pattern',fgColor: {argb: 'f3f8ff'}}
        cellDescrizioneDoc.font = {bold: true}
        cellDescrizioneDoc.value = tipoDoc.descrizione;
        const cellContenutoDoc = rowContenutiDocumenti.getCell(i +1);
        scriviScadenzaDocumento(documentoCaricato,cellContenutoDoc,ditta.anagrafica.idTipiDocumentoNecessari,tipoDoc._id.toString());
    });
}

function scriviScadenzaDocumento(documentoCaricato,cella,idTipiDocumentoNecessari,idTipoDoc) {
    if (documentoCaricato) {
        cella.value = documentoCaricato.dataScadenza ? moment(documentoCaricato.dataScadenza).format('DD/MM/YYYY') : 'PRESENTE';
        const isDocumentoScaduto = new Date().getTime() > new Date(documentoCaricato.dataScadenza).getTime() && cella.value !== 'PRESENTE';
        cella.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: isDocumentoScaduto ? 'dc3545' : '28a745' }}
        cella.font = {color: {argb: 'ffffff'}}
    } else {
        if (idTipiDocumentoNecessari && idTipiDocumentoNecessari.length > 0) {
            if (idTipiDocumentoNecessari.includes(idTipoDoc)) {
                cella.value = 'MANCANTE';
                cella.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'dc3545' }}
                cella.font = {color: {argb: 'ffffff'}}
            } else {
                cella.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }}
                cella.value = 'N/A'
            }
        } else {
            cella.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'fff2cc' }}
            cella.value = 'N/A';
        }
    }
}

function addTitleDitta(worksheet,ditta){
    const row = worksheet.addRow([ditta.anagrafica.denominazione.toUpperCase()]);
    row.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: '69a5fe' }}
    row.alignment = { vertical: 'middle' };
    row.font = { bold: true, size: 16 };
    row.height = 40;
}

async function createPdfFileFromExcel(filePath) {
    const pdfFilePath = filePath.replaceAll('.xlsx','.pdf');
    var fonts = {
        Roboto: {
            normal: 'fonts/Roboto-Regular.ttf',
            bold: 'fonts/Roboto-Medium.ttf',
            italics: 'fonts/Roboto-Italic.ttf',
            bolditalics: 'fonts/Roboto-MediumItalic.ttf'
        }
    };
    var printer = new PdfPrinter(fonts);
    const pdfDefinition = {
        pageOrientation: 'landscape',
        content: [
            {
                table: {
                    widths: ['5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%','5.5%'],
                    body: [
                        ['Column 1', 'Column 2', 'Column 3','Column 1', 'Column 2', 'Column 3','Column 1', 'Column 2', 'Column 3','Column 1', 'Column 2', 'Column 3','Column 1', 'Column 2', 'Column 3','Column 1', 'Column 2', 'Column 3'],
                        ['One value goes here', 'Another one here', 'OK?','One value goes here', 'Another one here', 'OK?','One value goes here', 'Another one here', 'OK?','One value goes here', 'Another one here', 'OK?','One value goes here', 'Another one here', 'OK?','One value goes here', 'Another one here', 'OK?']
                    ]
                }
            }
        ],
    };
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
    pdfDoc.end();
    return pdfFilePath;
}

async function uploadFileToDb(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    return await axios.post('http://localhost:8080/api/documento', formData, {headers: {'Content-Type': 'multipart/form-data'}});
}

async function createReportDb(response,responsePdf,bodyRequest) {
    return new Promise((resolve, reject) => {
        ReportDb.create({nomeFile: response.data.file.filename,tipologia: bodyRequest.tipologia,dataGenerazione: new Date(),idStorage: response.data.file.id,idStoragePdf: responsePdf ? responsePdf.data.file.id : undefined})
            .then(result => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                reject();
            })
    })
}