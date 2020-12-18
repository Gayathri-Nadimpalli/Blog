const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require("bcryptjs");

const app = express();
const db = mongoose.connect('mongodb://localhost/blogAPI');
const port = process.env.PORT || 3000;
const Blog = require('./models/blogModel');
const User = require("./models/userModel"); 
const { urlencoded } = require('express');
const { promises } = require('fs');
var exphbs  = require('express-handlebars');

const blogRouter = require('./routes/blogRouter')(Blog, User);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars'); 
// blogRoutes

app.use('/',blogRouter); 
 
// Showing home page 
app.get("/", function (req, res) {  
    res.render("home"); 
});  

// Showing register form 
app.get("/register", function (req, res) { 
    res.render("register");  
});

// Showing login form 
app.get("/login", function (req, res) { 
    res.render("login"); 
}); 
 
// Showing login form 
app.get("/newBlog", function (req, res) { 
    res.render("newBlog"); 
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
           
  