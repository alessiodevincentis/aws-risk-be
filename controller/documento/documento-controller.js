exports.upload = (req, res)=>{
    console.log(req.body)
    upload(req,res, (err) => {
        if(err){
            res.status(500).send({error_code:1,err_desc:err});
            return;
        }
        res.send({error_code:0, error_desc: null, file_uploaded: true});
    });
}