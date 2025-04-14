const Product = require('../models/Product.modal');
const History = require('../models/History');

exports.getDashboard = async (req, res) => {
    try {
        // Lấy dữ liệu thống kê
        console.log('Bắt đầu lấy dữ liệu thống kê');
        const totalProducts = await Product.countDocuments();
        console.log('Tổng sản phẩm:', totalProducts);
        const totalQuantity = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);
        const recentActivities = await History.find()
            .sort({ date: -1 })
            .limit(5)
            .populate('productId', 'name');
        const lowStockItems = await Product.countDocuments({ quantity: { $lt: 5 } });

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = {
            highStock: await Product.countDocuments({ quantity: { $gt: 20 } }),
            mediumStock: await Product.countDocuments({ quantity: { $gt: 5, $lte: 20 } }),
            lowStock: lowStockItems
        };

        console.log('Dữ liệu trước khi render:');
        console.log('Stats:', {
            totalProducts,
            totalQuantity: totalQuantity[0]?.total || 0,
            recentTransactions: recentActivities.length,
            lowStockItems
        });
        console.log('Activities:', recentActivities);
        console.log('ChartData:', chartData);

        res.render('dashboard', {
            stats: {
                totalProducts,
                totalQuantity: totalQuantity[0]?.total || 0,
                recentTransactions: recentActivities.length,
                lowStockItems
            },
            activities: recentActivities.map(activity => ({
                ...activity.toObject(),
                productId: activity.productId || { name: 'Đã xóa' }
            })),
            chartData
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải trang dashboard' });
    }
};
