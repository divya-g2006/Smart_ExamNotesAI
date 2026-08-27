import UserModel from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

const setUserCookie = (res, token) => {
    const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
};

const signUserJwt = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing");
    return jwt.sign({ userId }, secret, { expiresIn: "1d" });
};

export const googleAuth = async (req,res) => {
    try {
        
        const {name , email} = req.body
        let user = await UserModel.findOne({email})
        if(!user){
            user = await UserModel.create({
                name,
                email
            })
        }
        const token = signUserJwt(user._id)
        setUserCookie(res, token);
        return res.status(200).json({ user, token })
    } catch (error) {
        return res.status(500).json({message:`googleSignup Error  ${error}`})
    }
    
}

export const signup = async (req, res) => {
    try {
        const name = normalizeEnvValue(req.body?.name);
        const email = normalizeEnvValue(req.body?.email).toLowerCase();
        const password = normalizeEnvValue(req.body?.password);

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const exists = await UserModel.findOne({ email }).lean();
        if (exists) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            name,
            email,
            password: passwordHash,
        });

        const token = signUserJwt(user._id);
        setUserCookie(res, token);
        return res.status(201).json({ user, token });
    } catch (error) {
        return res.status(500).json({ message: `signup error ${error}` });
    }
};

export const login = async (req, res) => {
    try {
        const email = normalizeEnvValue(req.body?.email).toLowerCase();
        const password = normalizeEnvValue(req.body?.password);

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        user.password = undefined;
        const token = signUserJwt(user._id);
        setUserCookie(res, token);
        return res.status(200).json({ user, token });
    } catch (error) {
        return res.status(500).json({ message: `login error ${error}` });
    }
};

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token")
         return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Logout Error  ${error}`})
    }
}
