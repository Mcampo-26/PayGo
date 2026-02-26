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
  balance: {
    type: Number,
    default: 0
  },
  // 🛡️ SEGURIDAD: Array para guardar IDs de pagos ya acreditados
  processedPayments: {
    type: [String],
    default: [],
    index: true // Optimiza la búsqueda para cuando el array crezca
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