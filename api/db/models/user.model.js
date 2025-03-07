const mongoose = require('mongoose');
const _ = require('lodash');

const jwt = require('jsonwebtoken');
// JWT Secret
const jwtSecret = "96160650812412108295cnwoehisdkjheri1927713379";
const crypto = require("crypto");
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

/* Instance Methods */

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // return the Document, except the password and sessions
    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        // create JSON Web Token and return it
        jwt.sign({
            _id: user._id.toHexString()
        }, jwtSecret, { expiresIn: '15m' }, (err, token) => {
            if(!err) {
                // no error
                resolve(token);
            } else {
                // there is an error
                reject();
            }
        });
    })
}

UserSchema.methods.generateRefreshAuthToken = function() {
    // This method simply generates a 64 byte hex string, it does not save it to the database.
    // saveSessionToDatabase() saves that.
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buffer) => {
            if(!err) {
                // no error
                let token = buffer.toString('hex');
                return resolve(token);
            }
        });
    });
}

UserSchema.methods.createSession = function() {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        // session saved to database successfully, so return refresh token
        return refreshToken;
    }).catch((err) => {
        return Promise.reject('Failed to save session to database.\n' + err);
    });
}

/* Model Methods (static methods) */

UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    // find user by id and token
    // used in auth middleware (verifySession)

    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;

    if(expiresAt > secondsSinceEpoch) {
        // has not expired
        return false;
    } else {
        // has expired
        return true;
    }
}

/* Middleware */

// Before a user document is saved, this code runs
UserSchema.pre('save', function(next) {
   let user = this;
   let costFactor = 10;

   if(user.isModified('password')) {
       // If the password field has been edited or changed, then run this code

       // Generate salt and hash password
       bcrypt.genSalt(costFactor, (err, salt) => {
           bcrypt.hash(user.password, salt, (err, hash) => {
               user.password = hash;
               next();
           });
       });
   } else {
       next();
   }
});

/* Helper Methods */

let saveSessionToDatabase = (user, refreshToken) => {
    // save session to database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });

        user.save().then(() => {
            // session saved successfully
            return resolve(refreshToken);
        }).catch((err) => {
            reject(err);
        });
    });
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);
module.exports = { User };
