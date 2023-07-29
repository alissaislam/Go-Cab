const express = require('express');
const router = express.Router();
const {Station} = require('../models/station')

router.get('/',async (req,res)=>{
    try{
const stations =await Station.find();
res.send(stations);
    }catch(err){
        res.status(500).send(err.message);
    }
});

router.get('/:id',async (req,res)=>{
    
  try {
     const station = await Station.findById(req.params.id);
     if(!station) return res.status(400).send("wrong id");
    res.send(station);
}catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/',async (req,res)=>{
    
    const station = new Station(req.body);
     station.save().then((station)=>{
        res.send(station);
     }).catch((err)=>{
        res.status(400).send(err.message);
     });
});

router.put('/:id',async (req,res)=>{
try{
    const station = await Station.findByIdAndUpdate(req.params.id,{
        $set:{
            name: req.body.name,
        }
    },
    {
        new:true
    }
    );
    if(!station) return res.status(404).send("wrong id");
    res.send(station);}catch(err){
        res.status(500).send(err.message);
    }
});

router.delete('/:id',async(req,res)=>{
    const station =await Station.findByIdAndRemove(req.params.id);
    if(!station) return res.status(404).send("wrong id");
    res.send(station);
});
  
 module.exports=router;
