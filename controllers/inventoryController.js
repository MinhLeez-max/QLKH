const mongoose = require('mongoose');
const Product = require('../models/Product.modal');
const History = require('../models/History');

const { validationResult } = require('express-validator');

// Xử lý nhập/xuất kho
exports.handleInventoryAction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, action, quantity, date, note } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        oldInput: req.body
      });
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }
    if (!['import', 'export'].includes(action)) {
      throw new Error('Invalid action type');
    }
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    // Lưu lịch sử
    const historyDoc = {
      productId: new mongoose.Types.ObjectId(productId),
      action,
      quantity: parseInt(quantity),
      date: date ? new Date(date) : new Date(),
      note: note || ''
    };

    const history = new History(historyDoc);
    await history.save({ session });

    // Cập nhật sản phẩm
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Product not found');

    if (action === 'import') {
      product.quantity += parseInt(quantity);
    } else {
      if (product.quantity < quantity) {
        throw new Error('Insufficient stock');
      }
      product.quantity -= parseInt(quantity);
    }

    await product.save({ session });
    await session.commitTransaction();
    res.redirect('/inventory/history');
    
  } catch (err) {
    await session.abortTransaction();
    console.error('❌ Error:', err.stack);
    res.status(500).send(`Lỗi ${req.body.action} kho: ${err.message}`);
  } finally {
    session.endSession();
  }
};

// Lấy lịch sử kho
exports.getInventoryHistory = async (req, res) => {
  console.log('✅ GET /inventory-history request received');
  try {
    const histories = await History.find({})
      .populate({
        path: 'productId',
        select: 'name sku',
        model: 'Product'
      })
      .sort({ date: -1 });

    // Xử lý trường hợp productId null
    const processedHistories = histories.map(item => ({
      ...item.toObject(),
      productId: item.productId || { name: 'Đã xóa', sku: 'N/A' }
    }));

    res.render('inventory-history', { 
      histories: processedHistories,
      backUrl: '/inventory/import' 
    });
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử:', err);
    res.status(500).send('Lỗi khi lấy lịch sử!');
  }
};

// Hiển thị form nhập kho
exports.showImportForm = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('inventory-import', { products });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).send('Lỗi khi tải form nhập kho');
  }
};

// Hiển thị form xuất kho
exports.showExportForm = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('inventory-export', { products });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).send('Lỗi khi tải form xuất kho');
  }
};
