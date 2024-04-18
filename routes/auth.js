var express = require('express');
var path = require('path')
var router = express.Router();
var authRouter = express.Router();
var userModel = require('../schemas/user')
var checkvalid = require('../validators/auth')
var checkvalidpass = require('../validators/resetpassword')
var checkvalidemail = require('../validators/resetemail')
var { validationResult } = require('express-validator');
var bcrypt = require('bcrypt')
var protect = require('../middlewares/protectLogin')
let sendmail = require('../helpers/sendmail')
let resHandle = require('../helpers/resHandle')
let config = require('../configs/config')


router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
router.get('/forgotpassword', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'forgotPassword.html'));
});
router.get('/resetpassword/:token', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'resetPassword.html'));
});
router.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});
router.post('/forgotpassword', checkvalidemail(), async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
  }

  let email = req.body.email;
  let user = await userModel.findOne({ email: email });

  if (!user) {
      return resHandle(res, false, "Email chưa tồn tại trong hệ thống");
  }

  let token = user.genResetPassword();
  await user.save();
  let url = `http://localhost:3000/auth/resetpassword/${token}`;

  try {
      await sendmail(user.email, url);
      return resHandle(res, true, "Gửi mail thành công");
  } catch (error) {
      user.tokenResetPasswordExp = undefined;
      user.tokenResetPassword = undefined;
      await user.save();
      return resHandle(res, false, error);
  }
});


router.post('/resetpassword/:token', checkvalidpass(), async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // Kiểm tra xác nhận mật khẩu
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(422).json({ errors: [{ msg: "Mật khẩu và xác nhận mật khẩu không khớp" }] });
    }

    let user = await userModel.findOne({
        tokenResetPassword: req.params.token
    });

    if (!user) {
        resHandle(res, false, "URL không hợp lệ");
        return;
    }

    if (user.tokenResetPasswordExp > Date.now()) {
        user.password = req.body.password;
        user.tokenResetPasswordExp = undefined;
        user.tokenResetPassword = undefined;
        await user.save();
        resHandle(res, true, "Đổi mật khẩu thành công");
    } else {
        resHandle(res, false, "URL không hợp lệ");
        return;
    }
});



router.post('/register', checkvalid(), async (req, res) => {
  // Extract fields from request body
  const { username, password, confirmPassword, email } = req.body;

  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
      return res.status(422).json({ errors: [{ msg: "Passwords do not match" }] });
  }

  try {
      // Create new user instance
      const newUser = new userModel({
          username,
          password, // Consider hashing the password before saving
          email,
          role: ["USER"]
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      // Save user to database
      await newUser.save();

      // Respond with success
      res.status(201).json({
          success: true,
          data: newUser
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Server error",
          error: error.message
      });
  }
});

router.post('/login', async function (req, res, next) {
  let password = req.body.password;
  let username = req.body.username;
  if (!password || !username) {
    resHandle(res, false, "username va password khong duoc de trong");
    return;
  }
  var user = await userModel.findOne({ username: username });
  if (!user) {
    resHandle(res, false, "username khong ton tai");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    var tokenUser = user.genJWT();
    res.status(200).cookie('token', tokenUser, {
      expires: new Date(Date.now() + config.COOKIES_EXP_HOUR * 3600 * 1000),
      httpOnly: true
    }).send({
      success: true,
      data: tokenUser
    })
  } else {
    resHandle(res, false, "password sai");
  }
});
router.get('/me', protect, async function (req, res, next) {
  resHandle(res, true, req.user);
});
router.post('/logout', async function (req, res, next) {
  resHandle(res, true, "dang xuat thanh cong");
});


module.exports = router;