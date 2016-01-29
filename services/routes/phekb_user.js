// Phekb_user routes 
var request = require('request');
/*var mongoose = require('mongoose');

var MONGO_CONNECTION = 'mongodb://localhost/phema-user';

var Schema = mongoose.Schema;


function nameValidator (v) {
  if (!v || typeof v === 'undefined') {
    return false;
  }

  return v.length >= 4;
}

var PhemaUser = new Schema({
  firstName: {
    type: String,
    require: true,
    validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  lastName: {
    type: String,
    require: true,
    validate: [nameValidator, 'The name must be at least 4 characters long']
  },
  email: {
    type: String,
    require: true,
  },
  password: { 
    type: String,
    require: true,
    default: 'abc123'
  },
  fromSite: {
    type: String,
    default: 'phema',
  },
  created: {
    type: Date,
    default: Date.now
  },
  admin: {
    type: Boolean
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
  
});

var UserRepo = mongoose.model('PhemaUser', PhemaUser);

// MongoDB configuration
mongoose.connect(MONGO_CONNECTION, function(err) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});


function formatItemForReturn(item) {
    item.id =  item._id.toHexString();
    return item;
}
*/

/*
// callback(error, result) 
function findUser(data, callback)
{
  var search = {email: data.email};
  UserRepo.findOne(search, callback);
}

function addUser(data, callback) { 
  console.log("adding user to db"); 
  var item = new UserRepo(data);
  item.save(callback);
}
*/

exports.login = function(req, res){
  console.log("In Login. Set cookie and session");
 	
   console.log(req.body);
   res.set('Content-Type', 'application/json');
   var user_data = {email: req.body.email, password: req.body.password, firstName: req.body.email, lastName: 'Simpson'};
   //PhemaUser.findUser(user_data, function(err, user) { 
   // if (err){ res.status(403).send({user: null}); }
    //else {
      var retdata = {user: user_data };
      res.status(200).send(retdata);
    //}
   // });
 };
    

exports.logout = function(req, res){
  console.log("In logout.");
  console.log(req.body);
 	
   
   res.set('Content-Type', 'application/json');
   var retdata = {user: null };
   res.status(200).send(retdata);
    

};


exports.new_phekb = function(req, res){
  // Returns {user: user, id:phenotype_id }
  
  /*

  console.log("In new phekb. Set cookie and session");
  console.log(req);
  var user_data = {email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName};
  var nid = req.body.nid;
  function start_new_phekb(err, user) {
    console.log("Start new phekb nid: " + nid + " User: ");
    console.log(user);
    res.redirect('/api/library/');
  }
  UserRepo.findOne({email: user_data.email}, function(err, user){
    if (user) {
      // Is nid available here? 
      console.log("Nid in find one callback " + nid);
      start_new_phekb(err,user);
    }
    else {
      addUser(user_data, start_new_phekb);
    }
  });
  */
/*
   res.set('Content-Type', 'application/json');
   var retdata = {user: { firstName: 'Peter', lastName: 'Peltz'}, id: null};
   res.status(200).send(retdata);
    */

};

