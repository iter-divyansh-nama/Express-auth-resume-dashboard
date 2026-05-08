const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

const JWT_SECRET = "my_super_secret_key_12345";
const JWT_EXPIRES_IN = "1h";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect("mongodb://127.0.0.1:27017/userDB")
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

let transporter;

async function setupEmailTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Email transporter ready (Ethereal test account)");
  console.log("Test email user:", testAccount.user);
}

setupEmailTransporter().catch(console.error);

async function sendOTPEmail(toEmail, otp, userName) {
  const mailOptions = {
    from: '"MyApp" <noreply@myapp.com>',
    to: toEmail,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6c5ce7, #a29bfe); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">OTP Verification</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #2d3436;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #636e72;">Your One-Time Password (OTP) is:</p>
          <div style="background: #f0f0f5; border-radius: 10px; padding: 20px; margin: 20px 0; display: inline-block;">
            <span style="font-size: 36px; font-weight: 700; color: #6c5ce7; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #b2bec3;">This OTP expires in <strong>5 minutes</strong>.</p>
          <p style="font-size: 13px; color: #b2bec3;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #b2bec3;">
          &copy; 2026 MyApp. All rights reserved.
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("OTP Email sent to:", toEmail);
  console.log("OTP:", otp);
  console.log("View email at:", previewUrl);

  return previewUrl;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be at least 1"],
    max: [120, "Age must be at most 120"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authenticateToken(req, res, next) {
  const token = req.cookies.token || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

app.get("/register", (req, res) => {
  res.render("register", { message: null, error: null });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("register", {
        message: null,
        error: "This email is already registered. Please login instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      age: Number(age),
      password: hashedPassword,
    });

    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await newUser.save();

    const previewUrl = await sendOTPEmail(email, otp, name);

    res.render("verify-otp", {
      email: email,
      message: `OTP sent to ${email}! Check the server console for the email preview link.`,
      error: null,
      previewUrl: previewUrl,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    let errorMessage = "Something went wrong.";
    if (err.code === 11000) errorMessage = "Email already registered.";
    else if (err.errors) {
      errorMessage = Object.values(err.errors).map((e) => e.message).join(", ");
    }
    res.render("register", { message: null, error: errorMessage });
  }
});

app.get("/verify-otp", (req, res) => {
  const email = req.query.email || "";
  res.render("verify-otp", {
    email,
    message: null,
    error: null,
    previewUrl: null,
  });
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("verify-otp", {
        email,
        message: null,
        error: "User not found.",
        previewUrl: null,
      });
    }

    if (user.isVerified) {
      return res.render("verify-otp", {
        email,
        message: "Account already verified! Please login.",
        error: null,
        previewUrl: null,
      });
    }

    if (!user.otp || user.otpExpiry < new Date()) {
      return res.render("verify-otp", {
        email,
        message: null,
        error: "OTP expired. Please request a new one.",
        previewUrl: null,
      });
    }

    if (user.otp !== otp) {
      return res.render("verify-otp", {
        email,
        message: null,
        error: "Invalid OTP. Please try again.",
        previewUrl: null,
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log("User verified:", email);

    res.render("otp-success", { name: user.name });
  } catch (err) {
    res.render("verify-otp", {
      email: req.body.email,
      message: null,
      error: err.message,
      previewUrl: null,
    });
  }
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("verify-otp", {
        email,
        message: null,
        error: "User not found.",
        previewUrl: null,
      });
    }

    if (user.isVerified) {
      return res.render("verify-otp", {
        email,
        message: "Already verified! Please login.",
        error: null,
        previewUrl: null,
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const previewUrl = await sendOTPEmail(email, otp, user.name);

    res.render("verify-otp", {
      email,
      message: "New OTP sent! Check your email.",
      error: null,
      previewUrl,
    });
  } catch (err) {
    res.render("verify-otp", {
      email: req.body.email,
      message: null,
      error: err.message,
      previewUrl: null,
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { message: null, error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", {
        message: null,
        error: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.render("login", {
        message: null,
        error: "Account not verified. Please verify your OTP first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", {
        message: null,
        error: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    console.log("Login successful:", email);
    res.redirect("/dashboard");
  } catch (err) {
    res.render("login", { message: null, error: err.message });
  }
});

app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    const allUsers = await User.find().select("-password -otp -otpExpiry").sort({ createdAt: -1 });

    res.render("dashboard", {
      user: user,
      users: allUsers,
      token: req.cookies.token,
    });
  } catch (err) {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const newUser = new User({ name, email, age: Number(age), password: hashedPassword, otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) });
    await newUser.save();

    const previewUrl = await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: "Registered! OTP sent to email.",
      userId: newUser._id,
      email: newUser.email,
      otp_for_testing: otp,
      emailPreview: previewUrl,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.isVerified) return res.status(400).json({ success: false, error: "Already verified" });
    if (!user.otp || user.otpExpiry < new Date()) return res.status(400).json({ success: false, error: "OTP expired" });
    if (user.otp !== otp) return res.status(400).json({ success: false, error: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified! Account active." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.isVerified) return res.status(400).json({ success: false, error: "Already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const previewUrl = await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ success: true, message: "New OTP sent!", otp_for_testing: otp, emailPreview: previewUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });
    if (!user.isVerified) return res.status(403).json({ success: false, error: "Verify OTP first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, age: user.age, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/auth/profile", (req, res, next) => {
  const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) return res.status(401).json({ success: false, error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { return res.status(403).json({ success: false, error: "Invalid token" }); }
}, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
  res.status(200).json({ success: true, data: user });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;
    const hashed = await bcrypt.hash(password || "default123", 10);
    const user = new User({ name, email, age: Number(age), password: hashed });
    const saved = await user.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.code === 11000 ? "Email exists" : err.message });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, age: Number(age) }, { new: true, runValidators: true, overwrite: true });
    if (!user) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, message: `'${user.name}' deleted`, data: user });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/", (req, res) => res.redirect("/register"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
