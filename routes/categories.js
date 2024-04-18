const express = require('express');
const router = express.Router();
const Category = require('../schemas/category');
var path = require('path')
/*
   Route GET để lấy danh sách tất cả các danh mục
*/
router.get('/add', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'listCategory.html'));
  });
router.get('/', async function (req, res, next) {
    try {
        // Lấy tất cả các danh mục
        const categories = await Category.find({}).exec();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route GET để lấy thông tin của một danh mục dựa trên ID
*/
router.get('/:id', async function (req, res, next) {
    try {
        // Tìm kiếm danh mục dựa trên ID
        const category = await Category.findById(req.params.id).exec();
        if (!category) {
            // Nếu không tìm thấy danh mục, trả về mã lỗi 404
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route POST để tạo một danh mục mới
*/
router.post('/', async function (req, res, next) {
    try {
        // Tạo một danh mục mới dựa trên thông tin từ yêu cầu
        const newCategory = new Category({
            name: req.body.name
        });
        // Lưu danh mục mới vào cơ sở dữ liệu
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route PUT để cập nhật thông tin của một danh mục dựa trên ID
*/
router.put('/:id', async function (req, res, next) {
    try {
        // Tìm kiếm danh mục dựa trên ID và cập nhật thông tin
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!category) {
            // Nếu không tìm thấy danh mục, trả về mã lỗi 404
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route DELETE để xóa một danh mục dựa trên ID
*/
router.delete('/:id', async function (req, res, next) {
    try {
        // Xóa danh mục dựa trên ID
        const category = await Category.findByIdAndDelete(req.params.id).exec();
        if (!category) {
            // Nếu không tìm thấy danh mục, trả về mã lỗi 404
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
