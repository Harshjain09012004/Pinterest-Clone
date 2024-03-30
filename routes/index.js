var express = require('express');
var router = express.Router();
var postModel = require('./posts');
var userModel = require('./users');
var passport = require('passport');

const upload = require('./multer');

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

var localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/profile',isLoggedIn,async function(req,res,next){

  var user = await req.user.populate('postId');

  res.render('profile',{user});
})

router.get('/login',function(req,res,next){
  console.log(req.flash('error'))
  res.render('login',{error:req.flash('error')});
})

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  })
});

router.get('/feed',isLoggedIn,async function(req,res,next){

  var postData = await postModel.find().populate('userId');
  res.render('feed',{postData});
})

router.get('/CreatePost',isLoggedIn,function(req,res,next){
  res.render('CreatePost');
})

router.get('/update',function(req,res,next){
  res.render('update');
})

router.post('/SearchPost/:user',isLoggedIn,async function(req,res,next){
  var user = req.params.user;
  var userdata = await userModel.findOne({username:user}).populate('postId');
  res.json(userdata)
})

router.post('/deletePost/:id',isLoggedIn,async function(req,res,next){
  var postId = req.params.id;
  await postModel.deleteOne({_id:postId});
  res.redirect('/profile');
})

router.post('/search',isLoggedIn,async function(req,res,next){
  if(req.body.username)
  {
    var user = req.body.username;
    var userdata = await userModel.findOne({username:user}).populate('postId');
    res.render('searchprofile',{userdata});
  }
  else{
    res.send("No User Found !")
  }
  
})

router.post('/update',async function(req,res,next){
  var user = await userModel.findOne({_id:req.user._id});
  if(req.body.username)
  {
    user.username = req.body.username;
  }
  if(req.body.email)
  {
    user.email = req.body.email;
  }

  await user.save();
  res.redirect('/profile');
})

router.post('/register',function(req,res,next){
  var user = new userModel({
    username:req.body.username,
    email:req.body.email
  })

  userModel.register(user, req.body.password, function(err) {
  if (err) {
    console.error('Registration error:', err);
    return res.render('error', { error: err });
  }

  passport.authenticate('local')(req, res, function() {
    res.redirect('/profile');
  });
});

})

router.post('/login', passport.authenticate('local',{
  successRedirect:"/profile",
  failureRedirect:'/login',
  failureFlash:true
}),function(req,res,next){

});

router.post('/upload',upload.single('file'),async function(req,res,next){
  if(!req.file){
    return res.status(400).send('No files were uploaded');
  }

  const user = await userModel.findOne({_id:req.user._id});
  
  var postDetails = await postModel.create({

    caption:req.body.caption,
    imageUrl:req.file.filename,
    userId:req.user._id
  })

  user.postId.push(postDetails._id);
  await user.save();
  res.redirect("/profile");

});

router.post('/dpUploads',upload.single('dp'),async function(req,res,next){
  var user = await userModel.findOne({_id:req.user._id});
  user.dpImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){

    return next();
  }
  res.redirect('/login');
};

module.exports = router;