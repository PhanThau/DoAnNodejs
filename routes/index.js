var express = require('express');
var router = express.Router();
//router.use('/books',require('./books'));
router.use('/users',require('./users'));
router.use('/cloths',require('./cloths'));
router.use('/auth',require('./auth'));
router.use('/categories',require('./categories'));
router.use('/sizes',require('./sizes'));
router.use('/carts',require('./carts'));

module.exports = router;
