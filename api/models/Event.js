const mongoose = require('mongoose')

const EventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dropTime: Date,
  eventDate: {
    type: Date,
    required: true
  },
  hosts: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  sheetId: {
    type: String,
    required: true
  },
  formId: {
    type: String,
    required: true
  }
});


module.exports = mongoose.model('Event', EventSchema)
