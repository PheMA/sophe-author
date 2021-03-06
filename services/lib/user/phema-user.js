'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var MONGO_CONNECTION = process.env.PHEMA_USER_DB_URL;
const SALT_ROUNDS = 10;

var Schema = mongoose.Schema;

function emailValidator (email) {
  if (!email || typeof email === 'undefined') {
    return false;
  }

  // Regex from: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript/1373724#1373724
  var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
  return re.test(email);
}

function passwordValidator(password) {
  if (!password || typeof password === 'undefined') {
    return false;
  }

  return (password.length >= 6);
}

var UserSchema = new Schema({
  email: {
    type: String,
    require: true,
    unique: true,
    validate: [emailValidator, 'Please enter a valid e-mail address']
  },
  password: {
    type: String,
    require: true,
    select: false,
    validate: [passwordValidator, 'Please enter a password that is 6 characters or longer']
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  resetPasswordExpires: {
    type: Date,
  },
  resetPasswordToken: {
    type: String
  }
});

function formatUserForReturn(user) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
}

var UserModel = mongoose.model('User', UserSchema);

// MongoDB configuration
mongoose.connect(MONGO_CONNECTION, function(err) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});

var UserRepository = function() {}

UserRepository.prototype.getUser = function(id, callback) {
  return UserModel.findOne({_id: id }, function(err, user) {
    if (!user) {
      return callback({message: 'The specified user could not be found.'});
    }

    if (!err) {
      return callback(null, formatUserForReturn(user));
    }
    else {
      console.log(err);
      return callback({message: 'There was an error when searching for the user.'});
    }
  });
};

UserRepository.prototype.findUserByEmail = function(email, callback) {
  return UserModel.findOne({email: email }, function(err, user) {
    if (!user) {
      return callback({message: 'The specified user could not be found.'});
    }

    if (!err) {
      return callback(null, formatUserForReturn(user));
    }
    else {
      console.log(err);
      return callback({message: 'There was an error when searching for the user.'});
    }
  });
};

UserRepository.prototype.findUserByPasswordResetToken = function(token, callback) {
  return UserModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return callback({message: 'Password reset token is invalid or has expired.'});
    }

    if (!err) {
      return callback(null, formatUserForReturn(user));
    }
    else {
      console.log(err);
      return callback({message: 'There was an error when searching for the user to reset their password.'});
    }
  });
}

UserRepository.prototype.addUser = function(user, callback) {
  UserModel.findOne({email: user.email }, function(err, existingUser) {
    if (existingUser) {
      return callback({message: 'This e-mail address has already been used to create an account.  Please try logging in with that account, and reset the password if you no longer remember it.'});
    }

    if (err) {
      console.log(err);
      return callback({message: 'There was an error when searching for the user.'});
    }
    else {
      var userRecord = new UserModel({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });

      bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          userRecord.password = hash;

          userRecord.save(function(err) {
            console.log("User saved ", userRecord.email);
            if (err) {
              console.log(err);
              return callback({message: 'There was an error when saving the new user.'});
            }
            else {
              return callback(null, formatUserForReturn(userRecord));
            }
          });
        });
      });
    }
  });
};

UserRepository.prototype.updateUser = function(updatedUser, callback) {
  return UserModel.findOne({_id: updatedUser.id }, function(err, user) {
    if (!user) {
      return callback({message: 'The specified user could not be found.'});
    }
    else if (err) {
      console.log(err);
      return callback({message: 'There was an error when searching for the user.'});
    }

    user.firstName = updatedUser.firstName;
    user.lastName = updatedUser.lastName;
    // Any time the user is updated, we want to clear out the reset password fields.
    // If there is an outstanding reset password and someone is logged in and able
    // to reset this, the outstanding token should no longer be valid.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    if (updatedUser.resetPasswordToken) {
      user.resetPasswordToken = updatedUser.resetPasswordToken;
      user.resetPasswordExpires = updatedUser.resetPasswordExpires;
    }

    if (updatedUser.password) {
      bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
        bcrypt.hash(updatedUser.password, salt, function(err, hash) {
          user.password = hash;

          user.save(function(err) {
            console.log("User with password updated : ", user.email);
            if (err) {
              console.log(err);
              return callback({message: 'There was an error when saving the new user.'});
            }
            else {
              return callback(null, formatUserForReturn(user));
            }
          });
        });
      });
    }
    else {
      return user.save(function(err) {
        if(!err) {
          console.log("Updated : " , user.email);
          return callback(null, formatUserForReturn(user));
        } else {
          console.log('Internal error(%d): %s',res.statusCode,err.message);
          if (err.name === 'ValidationError') {
            return callback({ error: 'Validation error' });
          } else {
            return callback({ error: 'Server error' });
          }
        }
      });
    }
  });
};

UserRepository.prototype.authenticate = function(email, password, callback) {  
  UserModel.findOne({ email: email }).select('+password').exec(function(err, user) {
    if (err) {
      return callback(err, null);
    }

    // No user found just return the empty user
    if (!user) {
      return callback({ error: 'Invalid username or password' }, user);
    }

    bcrypt.compare(password, user.password, function(err, res) {
      if (err) { return callback(err, null); }
      if (res === false) { return callback({message: 'Invalid username or password'}, null); }
      user = formatUserForReturn(user);
      callback(null, user);
    });
  });
};

exports.UserRepository = UserRepository;

