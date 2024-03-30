const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterest");


const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required : true,
    unique : true
  },

  email: {
    type: String,
    required : true,
    unique : true
  },
  
  password: {
    type: String
  },
  postId: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  dpImage:{
    type:String,
    default:'default.png'
  }
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;
