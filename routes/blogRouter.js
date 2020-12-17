const { query } = require('express');
const express = require('express');

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