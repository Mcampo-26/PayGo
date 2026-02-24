import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  dni: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  meterId: { type: Schema.Types.ObjectId, ref: 'Meter' } // Relación con su medidor
}, { 
  timestamps: true,
  collection: 'users' 
});

const User = models.User || model('User', UserSchema);
export default User;