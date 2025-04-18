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

        // Thêm dữ liệu biểu đồ số lượng sản phẩm theo loại
        const quantityByType = await Product.aggregate([
            { $group: { _id: "$type", totalQuantity: { $sum: "$quantity" } } }
        ]);

        // Thêm dữ liệu biểu đồ số lượng nhập/xuất theo ngày trong 7 ngày gần nhất
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 ngày tính cả hôm nay

        const inventoryActionsByDay = await History.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        action: "$action"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.day": 1 } }
        ]);

        // Chuẩn bị dữ liệu cho biểu đồ line
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            days.push(d.toISOString().slice(0, 10));
        }

        const importCounts = [];
        const exportCounts = [];
        days.forEach(day => {
            const importData = inventoryActionsByDay.find(item => item._id.day === day && item._id.action === 'import');
            const exportData = inventoryActionsByDay.find(item => item._id.day === day && item._id.action === 'export');
            importCounts.push(importData ? importData.count : 0);
            exportCounts.push(exportData ? exportData.count : 0);
        });

        console.log('Dữ liệu trước khi render:');
        console.log('Stats:', {
            totalProducts,
            totalQuantity: totalQuantity[0]?.total || 0,
            recentTransactions: recentActivities.length,
            lowStockItems
        });
        console.log('Activities:', recentActivities);
        console.log('ChartData:', chartData);
        console.log('QuantityByType:', quantityByType);
        console.log('InventoryActionsByDay:', { days, importCounts, exportCounts });

        // Thêm dữ liệu biểu đồ phân bố sản phẩm theo nhà cung cấp
        const productCountBySupplier = await Product.aggregate([
            { $group: { _id: "$supplier", count: { $sum: 1 } } }
        ]);

        // Thêm dữ liệu biểu đồ số lượng sản phẩm thêm mới theo ngày trong 7 ngày gần nhất
        const productAdditionsByDayAgg = await Product.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const productAdditionsByDay = [];
        days.forEach(day => {
            const dayData = productAdditionsByDayAgg.find(item => item._id === day);
            productAdditionsByDay.push(dayData ? dayData.count : 0);
        });

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
            chartData,
            quantityByType,
            inventoryActionsByDayData: { days, importCounts, exportCounts },
            productCountBySupplier,
            productAdditionsByDayData: { days, counts: productAdditionsByDay }
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải trang dashboard' });
    }
};
