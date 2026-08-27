import express from "express";
import isAdminAuth from "../middleware/isAdminAuth.js";
import { adminLogin, changeAdminAccount } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.patch("/change-account", isAdminAuth, changeAdminAccount);

export default adminRouter;
