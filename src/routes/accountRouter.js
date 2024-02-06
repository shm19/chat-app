const express = require("express");
const AccountController = require("../controller/accountController");
const router = express.Router();

router.get("/:accountId", AccountController.getOne);

router.put("/:accountId", AccountController.updateProfile);

router.post("/register", AccountController.register);

router.post("/login", AccountController.login);

router.patch("/update-profile/:accountId", AccountController.updateProfile);

router.post("/request-password-reset", AccountController.requestPasswordReset);

router.patch("/reset-password", AccountController.resetPassword);

module.exports = router;
