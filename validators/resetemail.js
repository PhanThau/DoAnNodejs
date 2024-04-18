var { check } = require('express-validator');
var util = require('util');
let notifies = {
    NOTE_EMAIL: 'email phai dung dinh dang'
}

module.exports = function () {
    return [
        check('email', notifies.NOTE_EMAIL).isEmail(),
    ]
}