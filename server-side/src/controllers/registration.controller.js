const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const transporter = require('../utils/emailTransporter');
const userValidation = require('../utils/userValidation');
const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');

// Helper: Token Generator
const generateToken = (payload, expiresIn = null) => {
  const options = expiresIn ? { expiresIn } : undefined;
  console.log(`[TOKEN] Generating token for user: ${payload.email}`);
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};


const inviteAdmin = asyncWrapper(async (req, res, next) => {
    console.log('[INVITE ADMIN] Request Body:', req.body);
    const { email, role} = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        console.warn('[INVITE ADMIN] Email already exists:', email);
        return next(new AppError('User with this email already exists.', 400, httpStatusText.FAIL));
    }

    const invitationToken = generateToken({ email }, '24h');
    const invitationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

     // Generate username from email (part before the '@')
    const generatedUsername = email.substring(0, email.indexOf('@'));
    // Basic sanitization to remove non-alphanumeric characters
    const sanitizedUsername = generatedUsername.replace(/[^a-zA-Z0-9]/g, '');
    // Ensure username is at least 3 characters long (you might want more sophisticated logic)
    const username = sanitizedUsername.length >= 3 ? sanitizedUsername : `user_${Date.now().toString().slice(-5)}`;

    const newUser = new userModel({
        email: email,
        role: role,
        status: 'pending',
        invitationToken: invitationToken,
        invitationTokenExpiry: invitationTokenExpiry,
        username: username
    });

    console.log('[INVITE ADMIN] newUser.username before save:', newUser.username); 

    await newUser.save();
    console.log('[INVITE ADMIN] Pending admin user created:', email)

    const invitationLink = `http://localhost:5173/reset-password?token=${invitationToken}`; // Your frontend reset password route
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Invitation to Join Our Team as an Admin',
        html: `
            <p>Hello!</p>
            <p>You have been invited to join our team as an administrator with the role of <strong>${role}</strong>.</p>
            <p>Please click the following link to set your password and activate your account:</p>
            <p><a href="${invitationLink}">${invitationLink}</a></p>
            <p>This invitation link will expire in 24 hours.</p>
            <p>If you did not request this invitation, please ignore this email.</p>
            <p>Best regards,<br>Furniro Team</p>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('[EMAIL] Failed to send invitation email:', error);
            return next(new AppError('Error sending invitation email.', 500, httpStatusText.ERROR));
        }
        console.log('[EMAIL] Invitation email sent to:', email);
        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Invitation sent successfully.' });
    });
});

// POST /reset-password (adjust to handle invitation tokens)
const resetPassword = asyncWrapper(async (req, res, next) => {
    const { token, password } = req.body;
    console.log('[RESET PASSWORD] Token received:', token);

    const user = await userModel.findOne({
        $or: [
            { resetToken: token },
            { invitationToken: token, status: 'pending' }
        ],
        $or: [
            { resetTokenExpiry: { $gt: Date.now() } },
            { invitationTokenExpiry: { $gt: Date.now() } }
        ]
    }).select('+password +resetToken +resetTokenExpiry +invitationToken +invitationTokenExpiry');

    if (!user) {
        console.warn('[RESET PASSWORD] Invalid or expired token.');
        return next(new AppError('Invalid or expired token.', 400, httpStatusText.FAIL));
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.invitationToken = null;
    user.invitationTokenExpiry = null;
    user.status = 'active'; // Activate the user upon setting password

    await user.save();
    console.log('[RESET PASSWORD] Password reset for:', user.email);

    res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Password reset successfully. Your account is now active.' });
});


// POST /signup
const signup = asyncWrapper(async (req, res, next) => {
  const userData = req.body;
  console.log('[SIGNUP] Received signup data:', userData.email);

  if (!userValidation(userData)) {
    console.warn('[SIGNUP] Invalid user data');
    return next(new AppError('Invalid user data.', 400, httpStatusText.FAIL));
  }

  const existingUser = await userModel.findOne({ email: userData.email });
  if (existingUser) {
    console.warn('[SIGNUP] Email already exists:', userData.email);
    return next(
      new AppError(
        'User with this email already exists.',
        400,
        httpStatusText.FAIL
      )
    );
  }

  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);

  await userModel.create(userData);
  console.log('[SIGNUP] User created successfully:', userData.email);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: 'User signed up successfully',
  });
});

// POST /login
const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Attempted login with email:', email);

  const user = await userModel.findOne({ email });
  if (!user) {
    console.warn('[LOGIN] Email not found:', email);
    return next(
      new AppError('Invalid email or password.', 400, httpStatusText.FAIL)
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.warn('[LOGIN] Invalid password for:', email);
    return next(
      new AppError('Invalid email or password.', 400, httpStatusText.FAIL)
    );
  }

  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    console.warn(`[LOGIN] User ${email} has role ${user.role}, which is not allowed to log in.`);
    return next(
      new AppError('Only OWNER and ADMIN can log in.', 403, httpStatusText.FAIL, { 
        message: 'Only owner and admins can login!', 
      })
    );
  }
  await userModel.findByIdAndUpdate(user._id, { status: 'active' },{ new: true });

  const token = generateToken({
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    thumbnail: user.thumbnail,
  });

  console.log('[LOGIN] User logged in:', email);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Logged in successfully',
    data: { token },
  });
});

// GET /auth/google/callback
const google = (req, res) => {
  console.log('[GOOGLE AUTH] Google login callback for:', req.user.email);

  const token = generateToken({
    _id: req.user._id,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
    thumbnail: req.user.thumbnail,
  });

  console.log('[GOOGLE AUTH] Redirecting with token');
  res.redirect(`http://localhost:4200/auth/login?token=${token}`);
};

// POST /forgot-password
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  console.log('[FORGOT PASSWORD] Request for:', email);

  const user = await userModel.findOne({ email });
  if (!user) {
    console.warn('[FORGOT PASSWORD] Email not found:', email);
    return next(
      new AppError(
        "User with this email doesn't exist.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const resetToken = generateToken({ email: user.email }, '10m');
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

  await user.save();

  // const resetLink = `http://localhost:4200/auth/reset-password?token=${user.resetToken}`;
  const resetLink = `http://localhost:5173/reset-password?token=${user.resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reset Password',
    text: `Dear ${user.username},\n\nClick the link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('[EMAIL] Failed to send reset email:', error);
      return next(
        new AppError('Error sending email.', 500, httpStatusText.ERROR)
      );
    }

    console.log('[EMAIL] Reset email sent to:', user.email);
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: 'Email sent successfully.',
    });
  });
});

// POST /reset-password
// const resetPassword = asyncWrapper(async (req, res, next) => {
//   const { token, password } = req.body;
//   console.log('[RESET PASSWORD] Token received:', token);

//   const user = await userModel.findOne({ resetToken: token });
//   if (!user || user.resetTokenExpiry < Date.now()) {
//     console.warn('[RESET PASSWORD] Invalid or expired token.');
//     return next(
//       new AppError('Invalid or expired token.', 400, httpStatusText.FAIL)
//     );
//   }

//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(password, salt);
//   user.resetToken = null;
//   user.resetTokenExpiry = null;

//   await user.save();

//   console.log('[RESET PASSWORD] Password reset for:', user.email);

//   res.status(200).json({
//     status: httpStatusText.SUCCESS,
//     message: 'Password reset successfully.',
//   });
// });

// POST /logout
const logout = asyncWrapper(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.warn('[LOGOUT] No token provided');
    return next(new AppError('Token is required', 400, httpStatusText.FAIL));
  }
  try {
 
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken._id;  

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { status: 'inactive' },
      { new: true }
    );

    if (!updatedUser) {
      console.warn('[LOGOUT] User not found:', userId);
      return next(new AppError('User not found', 404, httpStatusText.FAIL));
    }

    console.log(`[LOGOUT] User ${userId} status set to inactive`);


    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: 'Logged out successfully. User status set to inactive.  Remember to invalidate JWT!',
      data: null,
    });
  } catch (error) {
   
    console.error('[LOGOUT] Error decoding/verifying token:', error);
    return next(new AppError('Invalid or expired token.', 401, httpStatusText.FAIL));
  }

  // res.status(200).json({
  //   status: httpStatusText.SUCCESS,
  //   message: 'Logged out successfully.',
  // });
});

module.exports = {
  signup,
  login,
  google,
  forgotPassword,
  resetPassword,
  logout,
  inviteAdmin,
};
