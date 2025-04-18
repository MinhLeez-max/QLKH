const Product = require('../models/Product.modal');
const History = require('../models/History');
const mongoose = require('mongoose');

// Trang thêm sản phẩm mới
exports.getAddProductPage = (req, res) => {
  res.render('add-product');
};

// Trang danh sách sản phẩm
exports.getProductList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7; // 7 sản phẩm mỗi trang
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const filterType = req.query.type || '';
    const minQuantity = req.query.minQuantity ? parseInt(req.query.minQuantity) : null;
    const maxQuantity = req.query.maxQuantity ? parseInt(req.query.maxQuantity) : null;

    // Build query object
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (filterType) {
      query.type = filterType;
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

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query)
    ]);

    // Trả về JSON khi:
    // 1. Có query param ?format=json
    // 2. Hoặc có header Accept: application/json
    if (req.query.format === 'json' || req.get('Accept')?.includes('application/json')) {
      return res.json({
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    }
    
    // Lấy danh sách các loại sản phẩm để hiển thị filter
    const types = await Product.distinct('type');

    // Mặc định render view EJS cho trình duyệt
    res.render('product-list', { 
      products: products.map(p => p.toObject()),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      search,
      filterType,
      minQuantity,
      maxQuantity,
      types,
      alert: req.query.alert || null
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
  }
};

// Trang cập nhật sản phẩm
exports.getUpdateProductPage = async (req, res) => {
  const id = req.params.id;
  try {
    // Check user permission here (assuming req.user.permissions is array of user's permissions)
    if (!req.user || !req.user.permissions.includes('edit_product')) {
      // Render edit-product page with alert message instead of redirect
      let product;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        product = await Product.findById(req.params.id);
      } else {
        product = await Product.findOne({ sku: req.params.id });
      }
      if (!product) {
        return res.status(404).send('Sản phẩm không tồn tại');
      }
      return res.render('update-product', {
        product: product.toObject(),
        alert: 'Bạn không có quyền sửa sản phẩm.'
      });
    }

    let product;
    // Kiểm tra nếu id là ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      // Nếu không, tìm sản phẩm bằng SKU
      product = await Product.findOne({ sku: id });
    }
    
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    res.render('update-product', { 
      product: product.toObject() 
    });
  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm:', err);
    res.status(500).send('Lỗi khi lấy sản phẩm để cập nhật.');
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  const id = req.body.id;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }

    // Cập nhật các thông tin của sản phẩm
    product.name = req.body.name;
    product.sku = req.body.sku;
    product.quantity = req.body.quantity;
    product.unit = req.body.unit;
    product.importPrice = req.body.importPrice;
    product.salePrice = req.body.salePrice;
    product.supplier = req.body.supplier;
    product.importDate = req.body.importDate;
    product.note = req.body.note;

    await product.save();
    res.redirect('/products');
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    res.status(500).send('Đã xảy ra lỗi khi cập nhật sản phẩm.');
  }
};

const { validationResult } = require('express-validator');

// Thêm sản phẩm mới
exports.addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        oldInput: req.body
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku }).session(session);
    if (existingProduct) {
      return res.status(400).json({ 
        error: 'Mã SKU đã tồn tại' 
      });
    }

    const newProduct = new Product({
      name: req.body.name.trim(),
      sku: req.body.sku.trim(),
      quantity: parseInt(req.body.quantity),
      unit: req.body.unit || 'cái',
      importPrice: parseFloat(req.body.importPrice),
      salePrice: parseFloat(req.body.salePrice),
      supplier: req.body.supplier?.trim(),
      importDate: req.body.importDate || new Date(),
      note: req.body.note?.trim()
    });

    await newProduct.save({ session });
    await session.commitTransaction();
    
    res.redirect('/products');
  } catch (err) {
    await session.abortTransaction();
    console.error('Lỗi khi thêm sản phẩm:', err);
    
    if (req.get('Accept')?.includes('application/json')) {
      res.status(500).json({ 
        error: 'Đã xảy ra lỗi khi thêm sản phẩm',
        details: err.message 
      });
    } else {
      res.status(500).render('error', { 
        message: 'Đã xảy ra lỗi khi thêm sản phẩm',
        error: err 
      });
    }
  } finally {
    session.endSession();
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    var id = req.body.id;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
  } catch (err) {
    console.log(err);
    res.status(500).send('Lỗi xóa sản phẩm!');
  }
};
