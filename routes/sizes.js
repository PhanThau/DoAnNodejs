const express = require('express');
const router = express.Router();
const Size = require('../schemas/size');
var path = require('path')
/*
   Route GET để lấy danh sách tất cả các size
*/
router.get('/add', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'listSize.html'));
  });
router.get('/', async function (req, res, next) {
    try {
        // Lấy tất cả các size
        const sizes = await Size.find({}).exec();
        res.status(200).json(sizes);
        //res.render('sizesList', { sizes: sizes }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});

/*
   Route GET để lấy thông tin của một size dựa trên ID
*/
router.get('/:id', async function (req, res, next) {
    try {
        // Tìm kiếm size dựa trên ID
        const size = await Size.findById(req.params.id).exec();
        if (!size) {
            // Nếu không tìm thấy size, trả về mã lỗi 404
            res.status(404).json({ error: "Size not found" });
            return;
        }
        res.status(200).json(size);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route POST để tạo một size mới
*/

router.post('/', async function (req, res, next) {
    try {
        // Tạo một size mới dựa trên thông tin từ yêu cầu
        const newSize = new Size({
            name: req.body.name
        });
        // Lưu size mới vào cơ sở dữ liệu
        await newSize.save();
        res.status(201).json(newSize);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route PUT để cập nhật thông tin của một size dựa trên ID
*/
router.put('/:id', async function (req, res, next) {
    try {
        // Tìm kiếm size dựa trên ID và cập nhật thông tin
        const size = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!size) {
            // Nếu không tìm thấy size, trả về mã lỗi 404
            res.status(404).json({ error: "Size not found" });
            return;
        }
        res.status(200).json(size);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
   Route DELETE để xóa một size dựa trên ID
*/
router.delete('/:id', async function (req, res, next) {
    try {
        // Xóa size dựa trên ID
        const size = await Size.findByIdAndDelete(req.params.id).exec();
        if (!size) {
            // Nếu không tìm thấy size, trả về mã lỗi 404
            res.status(404).json({ error: "Size not found" });
            return;
        }
        res.status(200).json({ message: "Size deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
