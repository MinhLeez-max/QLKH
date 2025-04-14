// var express = require('express');
// var router = express.Router();
// var Product = require('../modal/Product.modal');
// const History = require('../modal/History');
// const mongoose = require('mongoose');

// // Trang thêm sản phẩm mới
// router.get('/3', function (req, res) {
//   res.render('add-product');
// });

// // Trang danh sách sản phẩm
// router.get('/1', async function (req, res) {
//   try {
//     let products = await Product.find();
//     res.render('product-list', { products: products });
//   } catch (err) {
//     console.error('Lỗi khi lấy danh sách sản phẩm:', err);
//     res.status(500).send('Đã xảy ra lỗi khi lấy danh sách sản phẩm.');
//   }
// });

// // Trang cập nhật sản phẩm
// router.get('/2/:id', async function (req, res) {
//   const id = req.params.id;
//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).send('Sản phẩm không tồn tại');
//     }
//     res.render('update-product', { product: product });
//   } catch (err) {
//     console.error('Lỗi khi lấy sản phẩm:', err);
//     res.status(500).send('Lỗi khi lấy sản phẩm để cập nhật.');
//   }
// });

// // Cập nhật sản phẩm
// router.post('/update-product', async function (req, res) {
//   const id = req.body.id;
//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).send('Sản phẩm không tồn tại');
//     }

//     product.name = req.body.name;
//     product.sku = req.body.sku;
//     product.quantity = req.body.quantity;
//     product.unit = req.body.unit;
//     product.importPrice = req.body.importPrice;
//     product.salePrice = req.body.salePrice;
//     product.supplier = req.body.supplier;
//     product.importDate = req.body.importDate;
//     product.note = req.body.note;

//     await product.save();
//     res.redirect('/1');
//   } catch (err) {
//     console.error('Lỗi khi cập nhật sản phẩm:', err);
//     res.status(500).send('Đã xảy ra lỗi khi cập nhật sản phẩm.');
//   }
// });

// // Thêm sản phẩm mới
// router.post('/', async function (req, res) {
//   try {
//     const newProduct = new Product({
//       name: req.body.name,
//       sku: req.body.sku,
//       quantity: req.body.quantity,
//       unit: req.body.unit,
//       importPrice: req.body.importPrice,
//       salePrice: req.body.salePrice,
//       supplier: req.body.supplier,
//       importDate: req.body.importDate,
//       note: req.body.note
//     });

//     await newProduct.save();
//     res.redirect('/1');
//   } catch (err) {
//     console.error('Lỗi khi thêm sản phẩm:', err);
//     res.status(500).send('Đã xảy ra lỗi khi thêm sản phẩm.');
//   }
// });

// // Xóa sản phẩm
// router.post("/delete-product", async function (req, res, next) {
//   try {
//     var id = req.body.id;
//     await Product.findByIdAndDelete(id);
//     res.redirect('/1');
//   } catch (err) {
//     console.log(err);
//     res.status(500).send('Lỗi xóa sản phẩm!');
//   }
// });

// // Xem lịch sử sản phẩm

// // router.get('/7/:productId', async (req, res) => {
// //   try {
// //     const product = await Product.findById(req.params.productId);
// //     if (!product) {
// //       return res.status(404).send('Không tìm thấy sản phẩm');
// //     }

// //     const history = await History.find({ productId: req.params.productId })
// //       .sort({ date: -1 })
// //       .limit(50);

// //     res.render('inventory-history', {
// //       product: product,
// //       history: history
// //     });
// //   } catch (err) {
// //     console.error('Lỗi khi lấy lịch sử:', err);
// //     res.status(500).send('Lỗi khi lấy lịch sử sản phẩm');
// //   }
// // });

// // GET trang xóa sản phẩm
// router.get('/4', function (req, res) {
//   res.render('delete-product');
// });

// // Hiển thị form nhập kho
// router.get('/5', function (req, res) {
//   res.render('import-stock');
// });

// // Hiển thị form xuất kho
// router.get('/6', function (req, res) {
//   res.render('export-stock');
// });

// // Xử lý nhập/xuất kho
// router.post('/inventory-action', async (req, res) => {
//   console.log('--- Starting inventory action ---');
//   console.log('Request body:', req.body);
  
//   try {
//     // Verify MongoDB connection
//     if (mongoose.connection.readyState !== 1) {
//       throw new Error('MongoDB not connected');
//     }

//     const { productId, action, quantity, date, note } = req.body;
//     console.log('Processing action:', {productId, action, quantity});
    
//     // Validate inputs
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       throw new Error('Invalid product ID');
//     }
//     if (!['import', 'export'].includes(action)) {
//       throw new Error('Invalid action type');
//     }
//     if (isNaN(quantity) || quantity <= 0) {
//       throw new Error('Invalid quantity');
//     }

//     // Create history record
//     console.log('Creating history document...');
//     const historyDoc = {
//       productId: new mongoose.Types.ObjectId(productId),
//       action,
//       quantity: parseInt(quantity),
//       date: date ? new Date(date) : new Date(),
//       note: note || ''
//     };
//     console.log('History document:', historyDoc);

//     // Save history
//     const history = new History(historyDoc);
//     const savedHistory = await history.save();
//     console.log('✅ History saved successfully:', savedHistory);

//     // Verify the record exists
//     const foundHistory = await History.findById(savedHistory._id);
//     if (!foundHistory) {
//       throw new Error('History record not found after saving!');
//     }
//     console.log('✅ History verification passed');

//     // Update product
//     const product = await Product.findById(productId);
//     if (!product) throw new Error('Product not found');

//     if (action === 'import') {
//       product.quantity += parseInt(quantity);
//     } else {
//       if (product.quantity < quantity) {
//         throw new Error('Insufficient stock');
//       }
//       product.quantity -= parseInt(quantity);
//     }

//     await product.save();
//     console.log('✅ Product updated successfully');

//     res.redirect('/1');
    
//   } catch (err) {
//     console.error('❌ Error:', err.stack);
//     res.status(500).send(`Lỗi ${req.body.action} kho: ${err.message}`);
//   }
// });

// // 
// router.get('/7', async (req, res) => {
//   try {
//     const histories = await History.find({})
//       .populate('productId', 'name sku') // Lấy thông tin sản phẩm
//       .sort({ date: -1 }); // Mới nhất lên đầu

//     res.render('inventory-history', {
//       histories }); // Gửi dữ liệu sang view
//   } catch (err) {
//     console.error('Lỗi khi lấy lịch sử:', err);
//     res.status(500).send('Lỗi khi lấy lịch sử!');
//   }
// });

// router.get('/api/charts/stats', async (req, res) => {
//   try {
//     const [inventoryData, transactionData] = await Promise.all([
//       Product.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalQuantity: { $sum: "$quantity" },
//             totalProducts: { $sum: 1 },
//             avgPrice: { $avg: "$importPrice" }
//           }
//         }
//       ]),
//       History.aggregate([
//         {
//           $match: {
//             date: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
//           }
//         },
//         {
//           $group: {
//             _id: "$action",
//             count: { $sum: 1 },
//             totalQuantity: { $sum: "$quantity" }
//           }
//         }
//       ])
//     ]);

//     res.json({
//       success: true,
//       inventoryStats: inventoryData[0] || {
//         totalQuantity: 0,
//         totalProducts: 0,
//         avgPrice: 0
//       },
//       transactionStats: transactionData
//     });
    
//   } catch (err) {
//     console.error('Lỗi khi lấy dữ liệu thống kê:', err);
//     res.status(500).json({ 
//       success: false,
//       error: 'Lỗi server khi lấy dữ liệu thống kê' 
//     });
//   }
// });



// router.get('/9', (req, res) => {
//   res.render('charts');
// });

// module.exports = router;
