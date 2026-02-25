import mongoose, { Schema, model, models } from 'mongoose';

const MeterSchema = new Schema({
  // El owner vincula este medidor a un Usuario específico
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clientId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true // El DNI o ID de cliente para búsquedas rápidas
  },
  serialNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['CONNECTED', 'DISCONNECTED'], 
    default: 'CONNECTED' 
  },
  tag: { 
    type: String, 
    default: 'Residencial' 
  }
}, { 
  timestamps: true,
  collection: 'meters' 
});

const Meter = models.Meter || model('Meter', MeterSchema);
export default Meter;