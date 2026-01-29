const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { ROLES } = require("../utils/roles");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("tenantId").notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role, tenantId } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already registered" });

      const user = await User.create({
        name,
        email,
        password,
        role: role || ROLES.EDITOR,
        tenantId
      });

      res.status(201).json({ message: "User registered", id: user._id });
    } catch (err) {
      next(err);
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, role: user.role, tenantId: user.tenantId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;