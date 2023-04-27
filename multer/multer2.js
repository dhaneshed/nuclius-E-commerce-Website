const express= require('express');

const fs=require('fs');
const multer=require('multer');
const app= express();
app.set('view engine','ejs');
var storage= multer.diskStorage({
  destination:function(req,file,callback)
  {
    var dir= "./uploads"
    if(!fs.existsSync(dir))
    {
      fs.mkdirSync(dir);
    }
    callback(null,dir);
  },
  filename:function(req,file,callback)
  {
    callback(null,file.originalname);
  }
});

var upload= multer({storage:storage}).array('files',12);
app.post('/upload',(req,res,next)=>{
  upload(req,res,function(err){
  if(err){
    return res.send("Something gone wrong");

  }
  res.send("Upload Complete");
   }) 
});
app.get('/upload',(req,res)=>{
  res.render('user/fileUpload');
});
