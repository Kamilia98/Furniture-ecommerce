const asyncWrapper = require('../middlewares/asyncWrapper.middleware');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Settings = require('../models/settings.model');

const getSettings = asyncWrapper(async (req, res, next) => {
 
    // console.log('User from token:', req.user);
    
    if (!req.user || !req.user._id) {
      return next(new AppError('User not authenticated', 401, httpStatusText.ERROR));
    }
  
    const userId = req.user._id;
    // console.log('User ID:', userId);
    
    const settings = await Settings.findOne({ userId });
    if (!settings) {
   
      const defaultSettings = new Settings({ userId });
      await defaultSettings.save();
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { settings: defaultSettings }
      });
    }
  
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { settings }
    });
  });
const updateSettings = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const updates = req.body;

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!settings) {
    return next(new AppError('store not found', 404, httpStatusText.FAIL));
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: 'Settings updated successfully',
    data: { settings }
  });
});

const resetSettings = asyncWrapper(async (req, res, next) => {
    const userId = req.user._id;
  
    const defaultSettings = {
      userId,
      profile: {
        name: '',
        email: '',
        picture: ''
      },
      theme: {
        mode: 'light',
        primaryColor: '#4f46e5'
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      security: {
        twoFactor: 'disabled'
      }
    };
  

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: defaultSettings },
      { new: true, upsert: true }
    );
  
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: 'Settings reset to default',
      data: { settings }
    });
  });

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};