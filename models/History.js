const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Lịch sử nhập/xuất kho
const HistorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Sản phẩm
  action: { type: String, enum: ['import', 'export'], required: true }, // Loại hành động (nhập hoặc xuất)
  quantity: { type: Number, required: true }, // Số lượng nhập/xuất
  date: { type: Date, default: Date.now }, // Ngày thực hiện hành động
  note: { type: String, default: '' }, // Ghi chú (tuỳ chọn)
});

const History = mongoose.model('History', HistorySchema);
module.exports = History;
