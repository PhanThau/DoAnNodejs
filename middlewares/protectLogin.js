const jwt = require('jsonwebtoken');
const userModel = require('../schemas/user');
const resHand = require('../helpers/resHandle');
const config = require('../configs/config');

module.exports = async function (req, res, next) {
    let token;

    // Kiểm tra xem token có trong header của request hay không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Nếu có, lấy token từ header
        token = req.headers.authorization.split(' ')[1];
    } else {
        // Nếu không, kiểm tra xem token có trong cookies không
        if (req.cookies.token) {
            // Nếu có, lấy token từ cookies
            token = req.cookies.token;
        }
    }

    // Nếu không tìm thấy token
    if (!token) {
        return resHand(res, false, "Vui lòng đăng nhập");
    }

    try {
        // Xác thực token
        let info = jwt.verify(token, config.JWT_SECRETKEY);
        
        // Kiểm tra thời hạn của token
        if (info.exp * 1000 > Date.now()) {
            // Nếu token hợp lệ, lấy thông tin user từ database
            let id = info.id;
            let user = await userModel.findById(id);
            // Gán thông tin user vào req.user
            req.user = user;
            // Tiếp tục xử lý các middleware hoặc route tiếp theo
            next();
        } else {
            // Nếu token đã hết hạn, thông báo cho client và dừng xử lý
            return resHand(res, false, "Vui lòng đăng nhập");
        }
    } catch (error) {
        // Nếu xảy ra lỗi trong quá trình xác thực token, thông báo cho client và dừng xử lý
        return resHand(res, false, "Vui lòng đăng nhập");
    }
}
