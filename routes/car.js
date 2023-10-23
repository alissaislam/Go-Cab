const express = require('express');
const router= express.Router();
const { Car, validateCar,validateUpdateCar } = require('../models/car');
const multer  = require('multer');
const upload = multer()



router.get('/',async (req,res)=>{
    try{
const cars =await Car.find();
res.send(cars);
    }catch(err){
        res.status(500).send(err.message);
    }
});

router.get('/:id',async (req,res)=>{
    
  try {
     const car = await Car.findById(req.params.id);
     if(!car) return res.status(400).send("wrong id");
    res.send(car);
}catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/',upload.single('image'),async (req,res)=>{
    const {error} =validateCar(req.body);
    if(error)
     return res.status(400).send(error.details[0].message);

    const car = new Car({
        image:
        {
            name:req.file.originalname,
            data: req.file.buffer,
            contentType:req.file.mimetype
        },
        company: req.body.company,
        color: req.body.color,
        carNumber: req.body.carNumber,
        cost: req.body.cost
    });
     car.save().then((car)=>{
        res.send(car);
     }).catch((err)=>{
        res.status(400).send(err.message);
     });
});

router.put('/:id',upload.single('image'),async (req,res)=>{

    try{const {error} = validateUpdateCar(req.body);
   

    if(error)
     return res.status(400).send(error.details[0].message);

    const car = await Car.findById(req.params.id)
    if(req.file){
        driver.image={
             name:req.file.originalname,
             data: req.file.buffer,
             contentType: req.file.mimetype
             }
         }
    if(req.body.company)
    car.company = req.body.company
    if(req.body.color)
    car.color = req.body.color
    if(req.body.carNumber)
    car.carNumber = req.body.carNumber
    if(req.body.cost)
    car.cost = req.body.cost
    await car.save()

    if(!car) return res.status(404).send("wrong id");
    res.send(car);}catch(err){
        res.status(500).send(err.message);
    }
});

router.delete('/:id',async(req,res)=>{
    const car =await Car.findByIdAndRemove(req.params.id);
    if(!car) return res.status(404).send("wrong id");
    res.send(car);
});
  
 module.exports=router;
