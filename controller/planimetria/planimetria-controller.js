const PlanimetriaDb = require('../../model/planimetria.js');
const AttivitaLavorativaDb = require('../../model/attivita-lavorativa.js');

// retrieve and return all planimetrie
exports.find = async (req, res) => {
    let queryFilter = undefined;
    const planimetrie = await PlanimetriaDb.find(queryFilter).exec();
    for (const plan of planimetrie) {
        for (const area of plan.aree) {
            const attivitaLavorative = await AttivitaLavorativaDb.find({idArea: area.uuid}).exec();
            area.attivitaLavorative = attivitaLavorative;
        }
    }
    res.send(planimetrie)
}

exports.insert = (req, res)=>{
    PlanimetriaDb.create(req.body.planimetria)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting planimetria" })
        })
}

exports.update = (req, res)=>{
    PlanimetriaDb.findByIdAndUpdate(req.body.planimetria._id,req.body.planimetria)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while saving planimetria" })
        })


}

exports.delete = (req, res)=>{
    console.log(req.query)
    PlanimetriaDb.findByIdAndDelete(req.query.idPlanimetria)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while deleting planimetria" })
        })
}