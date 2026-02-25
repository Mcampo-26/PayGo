import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  dni: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true // Búsqueda ultra rápida para el Login
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
  // Relación: Un usuario puede tener una lista de medidores
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