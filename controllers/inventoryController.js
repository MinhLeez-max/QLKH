const mongoose = require('mongoose');
const Product = require('../models/Product.modal');
const History = require('../models/History');

const { validationResult } = require('express-validator');

// Xử lý nhập/xuất kho (tạo yêu cầu, trạng thái pending)
exports.handleInventoryAction = async (req, res) => {
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

    // Lưu lịch sử với trạng thái pending
    const historyDoc = {
      productId: new mongoose.Types.ObjectId(productId),
      action,
      quantity: parseInt(quantity),
      date: date ? new Date(date) : new Date(),
      note: note || '',
      status: 'pending'
    };

    const history = new History(historyDoc);
    await history.save();

    res.redirect('/inventory/history');
  } catch (err) {
    console.error('❌ Error:', err.stack);
    res.status(500).send(`Lỗi ${req.body.action} kho: ${err.message}`);
  }
};

// Lấy danh sách yêu cầu pending (admin)
exports.getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await History.find({ status: 'pending' })
      .populate({
        path: 'productId',
        select: 'name sku',
        model: 'Product'
      })
      .sort({ date: -1 });

    res.render('inventory-pending', { pendingRequests });
  } catch (err) {
    console.error('Lỗi khi lấy yêu cầu pending:', err);
    res.status(500).send('Lỗi khi lấy yêu cầu pending!');
  }
};

// Phê duyệt yêu cầu (admin) - không dùng transaction do MongoDB không hỗ trợ
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await History.findById(id);
    if (!request) throw new Error('Yêu cầu không tồn tại');
    if (request.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

    const product = await Product.findById(request.productId).select('quantity');
    if (!product) throw new Error('Sản phẩm không tồn tại');

    if (request.action === 'import') {
      product.quantity += request.quantity;
    } else {
      if (product.quantity < request.quantity) {
        throw new Error('Số lượng trong kho không đủ');
      }
      product.quantity -= request.quantity;
    }

    // No salePrice and importPrice validation or preservation needed



    request.status = 'approved';

    await product.save();
    await request.save();

    res.redirect('/inventory/pending');
  } catch (err) {
    console.error('❌ Error phê duyệt:', err.stack);
    res.status(500).send(`Lỗi phê duyệt yêu cầu: ${err.message}`);
  }
};

// Từ chối yêu cầu (admin)
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await History.findById(id);
    if (!request) throw new Error('Yêu cầu không tồn tại');
    if (request.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

    request.status = 'rejected';
    await request.save();

    res.redirect('/inventory/pending');
  } catch (err) {
    console.error('❌ Error từ chối:', err.stack);
    res.status(500).send(`Lỗi từ chối yêu cầu: ${err.message}`);
  }
};

// Lấy lịch sử kho
exports.getInventoryHistory = async (req, res) => {
  console.log('✅ GET /inventory-history request received');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const filterAction = req.query.action || '';
    const minQuantity = req.query.minQuantity ? parseInt(req.query.minQuantity) : null;
    const maxQuantity = req.query.maxQuantity ? parseInt(req.query.maxQuantity) : null;
    const filterStatus = req.query.status || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build query object
    let query = {};

    if (search) {
      // Search by product name (populate needed)
      const products = await Product.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const productIds = products.map(p => p._id);
      query.productId = { $in: productIds };
    }

    if (filterAction) {
      query.action = filterAction;
    }

    if (filterStatus) {
      query.status = filterStatus;
    }

    if (minQuantity !== null || maxQuantity !== null) {
      query.quantity = {};
      if (minQuantity !== null) {
        query.quantity.$gte = minQuantity;
      }
      if (maxQuantity !== null) {
        query.quantity.$lte = maxQuantity;
      }
    }

    if (startDate !== null || endDate !== null) {
      query.date = {};
      if (startDate !== null) {
        query.date.$gte = startDate;
      }
      if (endDate !== null) {
        query.date.$lte = endDate;
      }
    }

    const [histories, total] = await Promise.all([
      History.find(query)
        .populate({
          path: 'productId',
          select: 'name sku',
          model: 'Product'
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      History.countDocuments(query)
    ]);

    // Xử lý trường hợp productId null
    const processedHistories = histories.map(item => ({
      ...item.toObject(),
      productId: item.productId || { name: 'Đã xóa', sku: 'N/A' }
    }));

    res.render('inventory-history', { 
      histories: processedHistories,
      backUrl: '/inventory/import',
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      search,
      filterAction,
      minQuantity,
      maxQuantity,
      filterStatus,
      startDate: req.query.startDate || '',
      endDate: req.query.endDate || ''
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
