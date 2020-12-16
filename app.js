const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = mongoose.connect('mongodb://localhost/blogAPI');
const blogRouter = express.Router();
const port = process.env.PORT || 3000;
const Blog = require('./models/blogModel');
const User = require("./models/userModel"); 
const { urlencoded } = require('express');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// blogRoutes

blogRouter.route('/blogs')
  .post((req, res) => {
    const blog = new Blog(req.body);
    blog.save();
    return res.status(201).json(blog);
  })
  .get((req,res) => {
    Blog.find((err, blogs) => {
      if (err) { 
        return res.send(err);
      }
      return res.json(blogs);
      //return res.sendFile(path.join(__dirname + '/index.html'));
      //res.render("index"); 
    }); 
  })
  .delete((req,res) => {
    Blog.remove((err) => {
      return res.send(err);
    })
    return res.sendStatus(204);    
  }); 

  
blogRouter.route('/loginDetails')
  .get((req,res) => {
    const query = {};
    User.find(query,(err, users) => {
          if (err) { 
            return res.send(err);
          } 
          return res.json(users);
      }); 
  }); 


blogRouter.route('/register')
  .post((req,res) => {
    User.countDocuments({ username: req.body.username },(err, count) => {
        if (err) { 
          return res.send(err);
        }
        console.log(count);
        if (count !== 0) {
          return res.send('User aLready exists');
        } else {
            const user = new User(req.body);
            user.save();
            //return res.status(201).json(blog);
            return res.redirect("/login"); 
        }
      }) 
  }) ;

blogRouter.route('/login')
  .post((req,res) => {
    User.countDocuments({username: req.body.username, password: req.body.password},(err, count) => {
      if (err) { 
        return res.send(err);
      }
      console.log(count);
      if (count == 0) {
        return res.send('Invalid Username or password');
      } else {
        
        // user is admin user then show all the blogs
        // user is not admin then show only approved blogs
        console.log('username', req.body.username);
        if (req.body.username == 'admin'){
          query = {}
        } else {
          query = {approved : "Y"}
        }
    
        Blog.find(query, (err, blogs) => { 
                    
          if (err) { 
            return res.send(err);
          }
          return res.json(blogs);

        });
      } 
        
    });
  });

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
 
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
