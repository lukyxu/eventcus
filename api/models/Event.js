const mongoose = require('mongoose')

const EventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dropTime: Date,
  hosts: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
});


module.exports = mongoose.model('Event', EventSchema)
