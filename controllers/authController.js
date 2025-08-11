const User = require("../models/User");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "staff").optional(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Register new user
const register = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password, role } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ message: "Username already exists" });

  const user = new User({ username, password, role });
  await user.save();

  res.status(201).json({ message: "User registered successfully" });
});

// Login user and issue JWT
const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const validPassword = await user.comparePassword(password);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

module.exports = { register, login };
