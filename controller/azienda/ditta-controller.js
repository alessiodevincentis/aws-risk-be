const DittaDb = require('../../model/ditta.js')
const PersonaleDb = require('../../model/personale.js')
const MezzoDb = require('../../model/mezzo.js')
const xlsx = require('xlsx');

// retrieve and return all aziende
exports.find = (req, res)=>{
    let queryFilter = undefined;
    if (req.query.codiceFiscale) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.codiceFiscale'] = {$regex:req.query.codiceFiscale,$options: 'i'}
    }
    if (req.query.partitaIva) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.partitaIva'] = {$regex:req.query.partitaIva,$options: 'i'}
    }
    if (req.query.indirizzo) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.indirizzo'] = {$regex:req.query.indirizzo,$options: 'i'}
    }
    if (req.query.note) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['anagrafica.note'] = {$regex:req.query.note,$options: 'i'}
    }
    if (!req.query.mostraArchiviate) {
        queryFilter = queryFilter ? queryFilter : {};
        queryFilter['$and'] = [{$or: [{dataArchiviazione:{$eq:null}},{dataArchiviazione: {$exists: false}}]}]
    }
    DittaDb.find(queryFilter)
        .then(ditte => {
            res.send(ditte)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditte information" })
        })
}

exports.findById = (req, res)=>{
    DittaDb.find({'anagrafica.codiceFiscale':req.query.idAzienda})
        .then(ditta => {
            res.send(ditta[0])
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving ditta information" })
        })


}

exports.insert = (req, res)=>{
    console.log(req.body)
    DittaDb.create(req.body.ditta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting azienda" })
        })
}

exports.update = (req, res)=>{
    console.log(req.body)
    DittaDb.findByIdAndUpdate(req.body.ditta._id,req.body.ditta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving azienda" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    DittaDb.findByIdAndDelete(req.query.idDitta)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting ditta" })
        })
}

exports.importFromExcel = async (req, res)=>{
    const workbook = xlsx.readFile(req.file.path);
    const datiImpresaWorksheet = workbook.Sheets[workbook.SheetNames[0]];
    const responsabiliAddettiWorksheet = workbook.Sheets[workbook.SheetNames[1]];
    const dipendentiWorksheet = workbook.Sheets[workbook.SheetNames[2]];
    const mezziWorksheet = workbook.Sheets[workbook.SheetNames[3]];
    const idAzienda = await createAziendaFromWorksheet(datiImpresaWorksheet,responsabiliAddettiWorksheet);
    await createDipendentiFromWorksheet(dipendentiWorksheet,idAzienda);
    await createMezziFromWorksheet(mezziWorksheet,idAzienda);
    res.send({status: 'ok'})
}

async function createAziendaFromWorksheet(datiImpresaWorksheet,responsabiliAddettiWorksheet) {
    const ditta = {anagrafica: xlsx.utils.sheet_to_json(datiImpresaWorksheet)[0]};
    ditta.responsabiliAddetti = createResponsabiliAddettiFromWorksheet(responsabiliAddettiWorksheet);
    const result = await DittaDb.create(ditta);
    return result._doc._id;
}

function createResponsabiliAddettiFromWorksheet(worksheet) {
    const responsabiliAddetti = xlsx.utils.sheet_to_json(worksheet);
    const respObject = {};
    if (responsabiliAddetti) {
        respObject.datoreLavoro = responsabiliAddetti.find(resp => resp['ruolo'] === 'datoreLavoro');
        respObject.rspp = responsabiliAddetti.find(resp => resp['ruolo'] === 'rspp');
        respObject.rls = responsabiliAddetti.find(resp => resp['ruolo'] === 'rls');
        respObject.medicoCompetente = responsabiliAddetti.find(resp => resp['ruolo'] === 'medicoCompetente');
        respObject.manovratoreGru = responsabiliAddetti.find(resp => resp['ruolo'] === 'manovratoreGru');
        respObject.manovratorePLE = responsabiliAddetti.find(resp => resp['ruolo'] === 'manovratorePLE');
        respObject.addettiPreposti = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiPreposti');
        respObject.addettiAntincendioEvacuazione = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiAntincendioEvacuazione');
        respObject.addettiPrimoSoccorso = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiPrimoSoccorso');
        respObject.addettiSpaziConfinati = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiSpaziConfinati');
        respObject.addettiLavoriQuota = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiLavoriQuota');
        respObject.addettiPesPavPei = responsabiliAddetti.filter(resp => resp['ruolo'] === 'addettiPesPavPei');
    }
    return respObject
}

async function createDipendentiFromWorksheet(worksheet,idAzienda) {
    const employeeData = xlsx.utils.sheet_to_json(worksheet);
    if (employeeData) {
        const dipendentiToSave = employeeData.map(dip => {
            dip.idAzienda = idAzienda;
            return {
                anagrafica: {...dip}
            }
        });
        await PersonaleDb.create(dipendentiToSave);
    }
}
async function createMezziFromWorksheet(worksheet,idAzienda) {
    const mezziData = xlsx.utils.sheet_to_json(worksheet);
    if (mezziData) {
        const mezziToSave = mezziData.map(mezzo => {
            mezzo.idAzienda = idAzienda;
            if (mezzo.dataScadenzaRCA) {
                const dataScadenzaRCAConverted = xlsx.SSF.parse_date_code(mezzo.dataScadenzaRCA);
                const dataScadenzaRCA = new Date();
                dataScadenzaRCA.setFullYear(dataScadenzaRCAConverted.y);
                dataScadenzaRCA.setMonth(dataScadenzaRCAConverted.m - 1);
                dataScadenzaRCA.setDate(dataScadenzaRCAConverted.d);
                mezzo.dataScadenzaRCA = dataScadenzaRCA;
            }
            if (mezzo.dataScadenzaRevisione) {
                const dataScadenzaRevisioneConverted = xlsx.SSF.parse_date_code(mezzo.dataScadenzaRevisione);
                const dataScadenzaRevisione = new Date();
                dataScadenzaRevisione.setFullYear(dataScadenzaRevisioneConverted.y);
                dataScadenzaRevisione.setMonth(dataScadenzaRevisioneConverted.m - 1);
                dataScadenzaRevisione.setDate(dataScadenzaRevisioneConverted.d);
                mezzo.dataScadenzaRevisione = dataScadenzaRevisione;
            }
            return {
                anagrafica: {...mezzo}
            }
        });
        await MezzoDb.create(mezziToSave);
    }
}