const User = require("../models/User");

// GET /register
exports.getRegister = (req, res) => {
  res.render("register");
};

// POST /register
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "Email is already registered.");
      return res.redirect("/register");
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save();
    
    req.flash("success_msg", "Registration successful! Please log in.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
       let msgs = Object.values(err.errors).map(val => val.message);
       req.flash("error_msg", msgs.join(', '));
       return res.redirect("/register");
    }
    req.flash("error_msg", "Server error during registration.");
    res.redirect("/register");
  }
};

// GET /login
exports.getLogin = (req, res) => {
  res.render("login");
};

// POST /login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash("success_msg", `Welcome back, ${user.name}!`);
    if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Server error during login.");
    res.redirect("/login");
  }
};

// GET /logout
exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destruction error:", err);
    res.redirect("/login");
  });
};
