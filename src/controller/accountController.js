const Account = require("../models/accountModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AccountController = {
  // Register a new account
  async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        theme,
        password,
      } = req.body;
      const account = await Account.create({
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        theme,
        password,
      });
      res.status(201).json({
        status: "success",
        data: {
          accountId: account.id,
          username: account.username,
          email: account.email,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Authenticate user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const account = await Account.findOne({ email }).select("+password");

      if (
        !account ||
        !(await account.comparePassword(password, account.password))
      ) {
        return res.status(401).json({
          status: "error",
          message: "Incorrect email or password",
        });
      }

      // Ideally, generate a token for the user session here

      res.status(200).json({
        status: "success",
        data: {
          accountId: account.id,
          username: account.username,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  async getOne(req, res) {
    const { accountId } = req.params;
    const account = await Account.findById(accountId);

    res.status(200).json({
      status: "success",
      data: account,
    });
  },

  // Update account details
  async updateProfile(req, res) {
    try {
      const { accountId } = req.params; // Assuming accountId is passed as a URL parameter
      const updates = req.body; // All updates should be in the request body

      const account = await Account.findByIdAndUpdate(accountId, updates, {
        new: true,
      });

      res.status(200).json({
        status: "success",
        data: account,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const account = await Account.findOne({ email });

      if (!account) {
        return res.status(404).json({
          status: "error",
          message: "Account not found",
        });
      }

      const resetToken = account.createPasswordRestToken();
      await account.save({ validateBeforeSave: false });

      // Send resetToken to user's email

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error sending token",
      });
    }
  },

  // Reset the password
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const account = await Account.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { $gt: Date.now() },
      });

      if (!account) {
        return res.status(400).json({
          status: "error",
          message: "Token is invalid or has expired",
        });
      }

      account.password = newPassword;
      account.passwordResetToken = undefined;
      account.passwordResetExpiresAt = undefined;
      await account.save();

      // Log the user in

      res.status(200).json({
        status: "success",
        message: "Password has been reset",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error resetting password",
      });
    }
  },
};

module.exports = AccountController;
