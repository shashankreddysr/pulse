import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const tenantId = "demo-org-1";
  const password = await bcrypt.hash("password123", 10);

  const users = [
    { name: "Demo Viewer", email: "viewer@pulsevision.com", role: "viewer", tenantId, password },
    { name: "Demo Editor", email: "editor@pulsevision.com", role: "editor", tenantId, password },
    { name: "Demo Admin",  email: "admin@pulsevision.com",  role: "admin",  tenantId, password }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }

  console.log("✅ Demo users ready:");
  console.log("viewer@pulsevision.com / password123");
  console.log("editor@pulsevision.com / password123");
  console.log("admin@pulsevision.com  / password123");

  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});