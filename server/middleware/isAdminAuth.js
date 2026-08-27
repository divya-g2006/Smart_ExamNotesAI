import jwt from "jsonwebtoken";

const getAdminJwtSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

const isAdminAuth = (req, res, next) => {
  try {
    const secret = getAdminJwtSecret();
    if (!secret) {
      return res.status(500).json({ message: "Missing JWT_SECRET/ADMIN_JWT_SECRET" });
    }

    const cookieName = process.env.ADMIN_COOKIE_NAME || "admin_token";
    const token = req.cookies?.[cookieName];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, secret);
    if (!payload?.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isAdminAuth;
