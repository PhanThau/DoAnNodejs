const express = require('express');
const router = express.Router();
const Cloth = require('../schemas/cart');
const resHandle = require('../helpers/resHandle');
var path = require('path')

router.post('/cart/:id', async function(req, res) {
    try {
        const userId = req.user._id; // Assuming you have user authentication
        const clothId = req.params.id;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.cloth.equals(clothId));
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1; // Increment quantity if item exists
        } else {
            cart.items.push({ cloth: clothId, quantity: 1 }); // Add new item if not existing
        }

        cart.updatedAt = Date.now();
        await cart.save();
        resHandle(res, true, cart);
    } catch (error) {
        resHandle(res, false, error);
    }
});
module.exports = router; 
