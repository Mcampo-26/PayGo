import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  dni: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    lowercase: true 
  },
  phone: { 
    type: String 
  },
  // CAMBIO CLAVE: Agregamos el balance para poder sumar los kWh
  balance: {
    type: Number,
    default: 0
  },
  meters: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Meter' 
  }]
}, { 
  timestamps: true,
  collection: 'users' 
});

const User = models.User || model('User', UserSchema);
export default User;