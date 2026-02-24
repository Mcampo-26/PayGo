import mongoose, { Schema, model, models } from 'mongoose';

const MeterSchema = new Schema({
  clientId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true // Para búsquedas instantáneas por DNI/Nro Cliente
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