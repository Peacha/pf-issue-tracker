/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  .get(function (req, res){
    let queryObj = req.query
    Object.keys(queryObj).map((e)=>{e === 'open' ? queryObj[e] === 'true' ? queryObj[e] = true : queryObj[e] = false : queryObj[e]})
    mongo.connect(CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
      if (err){
        console.log('error connecting to the database ' +err)
      } else{
        console.log('connected to database');
        const db = client.db('issue-tracker');
        db.collection('issues').find(queryObj).toArray((err,doc)=>{
          if (err){
            console.log('an error occured' + err);
          } else{
            res.send(doc);           
          }

          client.close();
        })
      }
    }) 
  })
    
    .post(function (req, res){
      console.log(req.params.project);
      //connect to database
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by)
      {
        res.status(200);
        res.json({error:"error - missing input"});
      } 
      else
      {
         let dbDoc = {issue_title:req.body.issue_title,
                      issue_text:req.body.issue_text,
                      created_by:req.body.created_by,
                      assigned_to:req.body.assigned_to || '',
                      status_text:req.body.status_text || '',
                      created_on: new Date(),
                      updated_on: new Date(),
                      project:project,
                      open:true
                      }
        mongo.connect(CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
          if (err){
            console.log('error connecting to the database ' +err)
          } else{
           console.log('connected to database');
            const db = client.db('issue-tracker'); 
            db.collection('issues').insertOne(dbDoc,(err,doc)=>{
              if (err){
                console.log(err);
              } else{
                console.log(doc.ops[0]);
                res.json(doc.ops[0]); 
              }
              client.close();
            });
          }
        })   
      }  
    })
    
    .put(function (req, res){
      if (req.body.constructor === Object && Object.keys(req.body).length === 0)
      {
        res.status(400);
        res.send('no updated fields sent');
      }
      else
      {
        let updateObj = {$set:{updated_on:new Date()}}
        Object.keys(req.body).filter((e)=>{if (req.body[e].length > 0 && e !== '_id'){updateObj.$set[e]=req.body[e]}})
        Object.keys(updateObj.$set).map((e)=>{e === 'open' ? updateObj.$set[e] === 'true' ? updateObj.$set[e] = true : updateObj.$set[e] = false : updateObj.$set[e]})
        mongo.connect(CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
          if (err){
            console.log('error connecting to the database ' + err);
          } else{
            console.log('connected to the database');
            const db = client.db('issue-tracker');
            db.collection('issues').findOneAndUpdate({_id:new ObjectId(req.body._id)},updateObj,{returnOriginal: false},(err,doc)=>{
              if (err) {
                console.log('error has occured' + err)
                res.send('400');
                res.send('unable to update ' + res.body._id);
              } else{
                res.status('200');
                res.send('successfully updated');
              }
              client.close();
            })
          }
        }) 
      }
    })
    
    .delete(function (req, res){
      if (!req.body._id)
      {
        res.status(400)
        res.send('_id error');
      } else{
        mongo.connect(CONNECTION_STRING,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{
          if (err){
            console.log('error connecting to the database' +err);
          } else{
            console.log('connected to the database');
            const db = client.db('issue-tracker');
            db.collection('issues').deleteOne({_id:new ObjectId(req.body_id)},(err,doc)=>{
              if (err){
                console.log('an error occured ' + err);
                res.status(400);
                res.send('could not delete '+ res.body._id);
              } else{
                console.log('deleted ' + res.body._id)
                res.status(200);
                res.send('deleted' + res.body._id);
              }
              client.close();
            });
          }
        });
      }  
    });
};
