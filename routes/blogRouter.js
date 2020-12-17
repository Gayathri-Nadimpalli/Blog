const { query } = require('express');
const express = require('express');
const bcrypt = require("bcryptjs");

function routes(Blog, User) {

  const blogRouter = express.Router();

  blogRouter.route('/test')
    .get((req, res) => {
        let promise = new Promise(function(resolve, reject) {
            User.findOne({}, (err, user) => {
                if (err) {
                    reject(err);
                }
                resolve(user);
            });
        });
        promise.then((result) => { res.send(result)} );
        
    });

  blogRouter.route('/blogs')
    .post((req, res) => {  

      console.log(req.body);
      const blog = new Blog(req.body);
      blog.save();
      return res.render("index"); //res.status(201).json(blog);
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
            console.log('req.body.password',req.body.password);
            console.log('result.password', result.password);
            if (bcrypt.compareSync(req.body.password, result.password))
            {
                Blog.find({}, (err, blogs) => {  

                    if (err) {  
                      return res.send(err);
                    }
                    //return res.json(blogs);
                    return res.render("index",{username : req.body.username});
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