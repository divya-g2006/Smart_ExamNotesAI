import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminModel from "../models/admin.model.js";

dotenv.config();

const normalizeEnvValue = (value) => {
  if (value === undefined || value === null) return "";
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const getAdminJwtSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

const setAdminCookie = (res, token) => {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "admin_token";
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const secret = getAdminJwtSecret();
    if (!secret) {
      return res.status(500).json({ message: "Missing JWT_SECRET/ADMIN_JWT_SECRET" });
    }

    const loginEmail = normalizeEnvValue(email).toLowerCase();
    const loginPassword = normalizeEnvValue(password);
    if (!loginEmail || !loginPassword) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await AdminModel.findOne({ email: loginEmail });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(loginPassword, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin._id }, secret, { expiresIn: "7d" });
    setAdminCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      email: admin.email,
      token,
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const changeAdminAccount = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const updates = {};
    const nextEmail = normalizeEnvValue(email).toLowerCase();
    const nextPassword = normalizeEnvValue(password);

    if (nextEmail) updates.email = nextEmail;
    if (nextPassword) updates.passwordHash = await bcrypt.hash(nextPassword, 10);

    if (!updates.email && !updates.passwordHash) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const admin = await AdminModel.findByIdAndUpdate(req.adminId, updates, { new: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({ message: "Admin account updated", email: admin.email });
  } catch (e) {
    const dup = String(e?.code) === "11000";
    return res.status(dup ? 409 : 500).json({ message: dup ? "Email already in use" : "Update failed" });
  }
};
