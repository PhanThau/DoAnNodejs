const express = require('express');
const router = express.Router();
const Cloth = require('../schemas/cloth');
const resHandle = require('../helpers/resHandle');
var path = require('path')
const session = require('express-session');
const Cart = require('../schemas/cart');

router.use(session({
    secret: 'aaaaa', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));
/*
   Route GET để lấy danh sách tất cả các sản phẩm
*/
router.get('/add', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'listCloth.html'));
  });
router.get('/', async function (req, res, next) {
    let queries = {};
    let exclude = ["sort", "page", "limit"];
    let stringArray = ["title", "description"]; // Bổ sung trường description vào mảng stringArray
    let numberArray = ["price", "quality", "category", "size"]; // Bổ sung trường size và quality vào mảng numberArray
    for (const [key, value] of Object.entries(req.query)) {
        if (!exclude.includes(key)) {
            if (stringArray.includes(key)) {
                queries[key] = new RegExp(value.replace(',', '|'), 'i');
            }
            if (numberArray.includes(key)) {
                let string = JSON.stringify(value);
                let index = string.search(new RegExp('lte|lt|gte|gt', 'g'));
                if (index < 0) {
                    queries[key] = value;
                } else {
                    queries[key] = JSON.parse(string.replaceAll(new RegExp('lte|lt|gte|gt', 'g'), (res) => '$' + res));
                }
            }
        }
    }
    queries.isDeleted = false;
    let limit = req.query.limit ? parseInt(req.query.limit) : 5; // Convert to integer
    let page = req.query.page ? parseInt(req.query.page) : 1; // Convert to integer
    let sort = {};
    if (req.query.sort) {
        if (req.query.sort.startsWith('-')) {
            sort[req.query.sort.substring(1, req.query.sort.length)] = -1;
        } else {
            sort[req.query.sort] = 1;
        }
    }
    try {
        const clothes = await Cloth.find(queries)
            .populate('category', 'name') // Populate thông tin của category, chỉ lấy trường 'name'
            .populate('size', 'name') // Populate thông tin của size, chỉ lấy trường 'name'
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .exec();
        resHandle(res, true, clothes);
    } catch (error) {
        resHandle(res, false, error);
    }
});

/*
   Route GET để lấy thông tin của một sản phẩm dựa trên ID
*/
router.get('/:id', async function (req, res, next) {
    try {
        const cloth = await Cloth.findById(req.params.id)
            .populate('category', 'name') // Populate thông tin của category, chỉ lấy trường 'name'
            .populate('size', 'name') // Populate thông tin của size, chỉ lấy trường 'name'
            .exec();
        resHandle(res, true, cloth);
    } catch (error) {
        resHandle(res, false, error);
    }
});

/*
   Route POST để tạo một sản phẩm mới
*/
router.post('/', async function (req, res, next) {
    try {
        const newCloth = new Cloth({
            title: req.body.title,
            photourl: req.body.photourl,
            price: req.body.price,
            size: req.body.size,
            description: req.body.description,
            quality: req.body.quality,
            category: req.body.category
        });
        await newCloth.save();
        resHandle(res, true, newCloth);
    } catch (error) {
        resHandle(res, false, error);
    }
});

/*
   Route PUT để cập nhật thông tin của một sản phẩm dựa trên ID
*/
router.put('/:id', async function (req, res, next) {
    try {
        const cloth = await Cloth.findByIdAndUpdate(req.params.id, req.body, { new: true });
        resHandle(res, true, cloth);
    } catch (error) {
        resHandle(res, false, error);
    }
});

/*
   Route DELETE để xóa một sản phẩm dựa trên ID
*/
router.delete('/:id', async function (req, res, next) {
    try {
        const cloth = await Cloth.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        resHandle(res, true, cloth);
    } catch (error) {
        resHandle(res, false, error);
    }
});
router.post('/cart/:id', async function(req, res) {
    if (!req.session.cart   ) {
        req.session.cart = {};
    }
    let cart = req.session.cart;
    try {
        const clothId = req.params.id;
        if (!cart[clothId]) {
            cart[clothId] = { quantity: 1 };
        } else {
            cart[clothId].quantity += 1;
        }
        resHandle(res, true, cart);
    } catch (error) {
        resHandle(res, false, error);
    }
});

/*
   Route GET to view the cart
*/
router.get('/cart', function(req, res) {
    console.log('Session:', req.session);  // Log the session to see what it contains
    resHandle(res, true, req.session.cart || {});
});

module.exports = router;
