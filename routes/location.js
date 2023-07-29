const express = require('express');
const router = express.Router();
const request = require('request');
const config=require('config');
const { Driver } = require('../models/driver');

  const bingMapsKey = config.get('bingMapApiKey');

  router.get('/:location',(req,res)=>{
    const location = req.params.location;
    const url = `http://dev.virtualearth.net/REST/v1/Locations?q=${location}&key=${bingMapsKey}`;
    request(url, (err, response, body) => {
        if (err) {
          res.status(500).send(err.message); 
        }
         else {
          const result = JSON.parse(body);
          const coordinates = result.resourceSets[0].resources[0].point.coordinates;
          const location={
            'latitude':coordinates[0] ,
            'longitude':coordinates[1]
          }
         res.send(location); 
        }
      });
    
  });
  // router.get('/why',(req,res)=>{
    
  //     res.send("hi");
  //  });

 

  module.exports=router;