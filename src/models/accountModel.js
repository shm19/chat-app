const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const accountSchema = new mongoose.Schema(
  {
    // Name
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    username: { type: String, trim: true, unique: true, required: true },

    // Contact
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    phoneNumber: {
      countryCode: { type: String },
      realNumber: { type: String },
    },

    theme: {
      type: String,
      default: "dark",
      enum: ["dark", "light"],
    },

    // Password
    password: { type: String, minLength: 8, select: false, required: true },
    passwordResetToken: { type: String },
    passwordResetExpiresAt: { type: Date },

    lastOnline: { type: Date, default: null },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

accountSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

accountSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

accountSchema.methods.comparePassword = async (inputPassword, userPassword) =>
  await bcrypt.compare(inputPassword, userPassword);

accountSchema.methods.createPasswordRestToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Account", accountSchema);
