const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  deadline: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Pending", "Submitted", "Missed"],
    default: "Pending"
  },
  tags: {
  type: [String],
  default: []
},
  createdAt: {
    type: Date,
    default: Date.now
  },
  details: {
  professor: { type: String, default: "" },
  room: { type: String, default: "" }
}
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
