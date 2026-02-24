import mongoose, { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
  meterId: { type: Schema.Types.ObjectId, ref: 'Meter', required: true },
  clientId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'QR_MP' }, // Ej: Mercado Pago
  externalReference: { type: String }, // ID de pago de la pasarela
}, { 
  timestamps: true, 
  collection: 'transactions' 
});

const Transaction = models.Transaction || model('Transaction', TransactionSchema);
export default Transaction;