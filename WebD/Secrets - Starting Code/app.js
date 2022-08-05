require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const url = "mongodb://localhost:27017/userDB";
mongoose.connect(url, {
  useNewUrlParser: true
}).then(function() {
  console.log("db is connected");

  // start node server
  app.listen(3000, () => {
    console.log(`app is listening on port 3000`);
  });
}).catch(function() {
  console.log("error connecting db");
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const UserModel = mongoose.model("User", userSchema);

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res){
  const user = new UserModel({email: req.body.email, password: req.body.password});
  user.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      console.log("error creating new user: " + err);
    }
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res){
  UserModel.findOne({email: req.body.email}, function(err, user){
    if(!err){
      if(user.password === req.body.password){
        res.render("secrets");
      }else{
        console.log("incorrect password");
      }
    }else{
      console.log("error in searching user: " + err);
    }
  });
});

app.get("/", function(req, res) {
  res.render("home");
});
