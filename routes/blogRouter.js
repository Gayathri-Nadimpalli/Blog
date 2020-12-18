const { query } = require('express');
const express = require('express');
const bcrypt = require("bcryptjs");
const { countDocuments } = require('../models/blogModel');

function routes(Blog, User) {

  const blogRouter = express.Router();

  blogRouter.route('/blogs')
    .post((req, res) => {  

      console.log(req.body);
      const blog = new Blog(req.body);
      blog.save();
      //return res.render("index"); //res.status(201).json(blog);
      let showUser = true;

      Blog.find({approved:"N"}, {title :1, body : 1}).lean().exec(function (err, data) {
        res.render("blogs", {blogs: data,
            showUser  : showUser,
            showAdmin : !showUser});
        });
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

  blogRouter.route('/blogs/:username')
    .get((req, res) => {
      let query = {}
      // user is admin user then show all the blogs
      // user is not admin then show only approved blogs
      console.log('username', req.params.username);
      if (req.params.username !== 'admin'){
        query = {approved : "Y"}
      }
      
      console.log('query',query);
      Blog.find(query, (err, book) => {
        if (err) {
          return res.send(err);
        }
        return res.json(book);
      });
    });

blogRouter.route('/approve')
    .get((req, res) => {
        console.log(req.body.title); 
        res.send('123');
    })
    .post((req, res) => {
        console.log(req.body);
        Blog.findOne({_id : req.body.blogID}, (err, blog) => {
            if(err) {
                return res.send(err);
            } else {
                blog.approved = "Y";
                console.log(blog);
                blog.save();
            }
        });
        res.redirect('back');

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
              user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
              user.save();
              //return res.status(201).json(blog);
              return res.redirect("/login"); 
          } 
        }) 
    }) ;  

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

blogRouter.route('/pendingBlogs')
  .get((req, res) => {
    Blog.find({approved:"N"}).lean().exec(function (err, data) {
        res.render("pendingBlogs", {blogs: data});
      });
  });

blogRouter.route('/login')
  .post((req, res) => {

    let promise = new Promise(function(resolve, reject) {
        let user = User.findOne({username: req.body.username}, {password : 1}, (err, user) => {
            if (err) {
                reject(err)
            } else {
                resolve(user)
            }
        } );
    });

    promise.then((result) => { 
    
        if (result == null) {
            console.log(result);
            return res.send('user doesnt exist');
        }
        else
        {
            // comparing with encrypted password
            console.log('req.body.password',req.body.password);
            console.log('result.password', result.password);
            if (bcrypt.compareSync(req.body.password, result.password))
            {
                let showUser = true;

                if (req.body.username == 'admin') {
                    showUser = false;
                } 
                Blog.find({approved:"Y"}, {title :1, body : 1}).lean().exec(function (err, data) {
                    res.render("blogs", {blogs: data,
                         showUser  : showUser,
                         showAdmin : !showUser});
                  });
                
            } else
            {
                return res.send("Bad request. Password don't match ");
            }
        }
        }
        ,(result) => { return res.send(result)} );
}); 
    
blogRouter.route('/logintest')
    .post((req,res) => {
      User.countDocuments({username: req.body.username, password: req.body.password},(err, count) => {
        if (err) { 
          return res.send(err);
        }
        console.log(count);
        if (count == 0) {
          return res.send('Invalid Username or password');
        } else {

        Blog.find({}, (err, blogs) => { 
                       
            if (err) {  
              return res.send(err);
            }
            return res.json(blogs);
            //res.render("index",{username : req.body.username});
          });
        }  
           
      }); 
    });

  return blogRouter;
}

module.exports = routes;