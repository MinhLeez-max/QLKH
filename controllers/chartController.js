const Product = require('../models/Product.modal');
const History = require('../models/History');

exports.getStats = async (req, res) => {
  try {
    const [inventoryStats, transactionStats] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
            totalProducts: { $sum: 1 },
            avgPrice: { $avg: "$importPrice" }
          }
        }
      ]),
      History.aggregate([
        {
          $match: {
            date: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      inventoryStats: inventoryStats[0] || { totalQuantity: 0, totalProducts: 0, avgPrice: 0 },
      transactionStats: transactionStats
    });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy dữ liệu thống kê' });
  }
};

exports.getInventoryChart = async (req, res) => {
  try {
    const inventoryData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$importPrice"] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: inventoryData[0] || { totalQuantity: 0, totalValue: 0 }
    });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ kho:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy dữ liệu biểu đồ kho' });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const salesData = await History.aggregate([
      {
        $match: { action: "export" }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ success: true, data: salesData });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ bán hàng:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy dữ liệu biểu đồ bán hàng' });
  }
};

exports.getProductsChart = async (req, res) => {
  try {
    const productsData = await Product.aggregate([
      {
        $project: {
          name: 1,
          quantity: 1,
          value: { $multiply: ["$quantity", "$importPrice"] }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data: productsData });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ sản phẩm:', err);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy dữ liệu biểu đồ sản phẩm' });
  }
};
