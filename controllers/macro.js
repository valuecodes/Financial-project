const Macro = require('../models/macroModel')

exports.getMacroData = async (req,res) => {
    const data = await Macro.find()
    res.send({data})
}

exports.saveMacroData = async (req,res) =>{
    let macroId = req.body._id
    let ratio = await Macro.findById(macroId)
    if(ratio){
        ratio.name = req.body.name
        ratio.frequence = req.body.frequence
        ratio.data = req.body.data
        await ratio.save()
        console.log('saved macro data')
        return res.send({msg:'Saved Macro data'})        
    }else{
        let newRatio = new Macro(req.body)
        await newRatio.save()
        console.log('created macro data')        
        return res.send({msg:'Created new Macro data'})
    }
}

exports.deleteMacroData = async (req,res) =>{
    const macroId = req.params.id
    const macro = await Macro.findById(macroId)
    if(macro){
        await macro.remove()
        return res.send({message:'Macro deleted'})
    }else{
        return res.status(404).send({message: 'Macro not found'})
    }
}