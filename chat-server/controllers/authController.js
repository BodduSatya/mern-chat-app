const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');

// Model
const User = require("../models/user");

const mailService = require("../services/mailer");

// this function will return you jwt token
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);


const catchAsync = (fn) => (req, res, next) => {
  Promise
    .resolve(fn(req, res, next))
    .then(() => {
      console.log('promis resolved')
    })
    .catch((err) => errorHandler(err));
};

// Register New User
exports.register = async (req, res, next) => {
  // check if a verified user with given email exists
  // if not verified than update prev one
  // if user is not created before than create a new one
  // generate an otp and send to email
  const { firstName, lastName, email, password, verified } = req.body;

  const filteredBody = filterobj(req.body, "firstName", "lastName", "email", "password");

  // check if a verifed user with given email exists
  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    // user with this email already exists, Please login
    res.status(400).json({
      status: "error",
      message: "Email already in use, Please login."
    })
  }
  else if (existing_user) {
    // if not verified than update prev one
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true
    });

    // generate OTP and send email to user
    req.userId = existing_user._id;
    next();
  }
  else {
    // if user record is not available in DB
    const new_user = await User.create(filteredBody);

    // generate OTP and send email to user
    req.userId = new_user._id;
    next();

  }
};

exports.sendOTP = async (req, res, next) => {
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });

  const otp_expirty_time = Date.now() + 10 * 60 * 1000; // 10min after otp is sent

  await User.findByIdAndUpdate(userId, {
    otp: new_otp,
    otp_expirty_time
  });

  // TODO Send mail

  mailService.sendEmail({
    from: process.env.FROM_EMAIL_ID,
    to: req.body.email,
    subject: "OTP for tawk",
    text: `Your OTP is ${new_otp} , This is valid for 10 Mintus`
  }).then((e) => {
    console.log("mail send status :: ", e);
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully"
    });
  }).catch((e) => {
    console.log('Mail sending failed! cause :: ', e);
    res.status(500).json({
      status: "fail",
      message: "OTP send failed!"
    });
  });


};

exports.verifyOTP = async (req, res, next) => {
  // verify otp and update user accordingly
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp_expirty_time: { $gt: Date.now() } });

  if (!user) {
    res.status(400).json({ message: "Email is invalid or OTP expired.", status: "error" })
  }

  if (!await user.correctOTP(otp, user.otp)) {
    res.status(400).json({ message: "OTP is incorrect", status: "error" })
    return;
  }

  //OTP is correct
  user.verified = true;
  user.otp = undefined;

  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully!",
    token,
  });

};

// User Login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // console.log(email, password);

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
    return;
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !user.password) {
    res.status(400).json({
      status: "error",
      message: "Incorrect password",
    });

    return;
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });

    return;
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Logged in successfully!",
    token,
  });
};

// type of routes => protected ( only logged in users can access token) & unprotected

// Protect
exports.protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(`You are not logged in! Please log in to get access.`, 401)
    );
  }
  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const this_user = await User.findById(decoded.id);
  if (!this_user) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exists.",
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (this_user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = this_user;
  next();
};


exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = process.env.HOST_SERVER_DOMAIN + `/auth/reset-password/?code=${resetToken}`;
    // TODO => Send Email with this Reset URL to user's email address

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
};