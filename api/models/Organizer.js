const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const OrganizerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  events: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  credentials: Object
});

OrganizerSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  bcrypt.hash(this.password, 12, (err, passwordHash)=>{
    if (err) {
      return next(err)
    }
    this.password = passwordHash;
    next();
  })
})

OrganizerSchema.methods = { 
  comparePassword: function (password, done) {  
    bcrypt.compare(password, this.password, (err,isMatch) => {
      if (err) {
        return done(err)
      } else {
        if (!isMatch) {
          return done(null, isMatch)
        }
        return done(null, this)
      }
    })
  },  
}

module.exports = mongoose.model('Organizer', OrganizerSchema)

