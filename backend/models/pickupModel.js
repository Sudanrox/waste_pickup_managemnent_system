import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
  wardNumber: Number,
  scheduledDate: Date,
  status: { type: String, default: "pending" },
});

export default mongoose.model("Pickup", pickupSchema);
