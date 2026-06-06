import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error-handler.middleware.js";

export class AuthUseCase {
  /**
   * Validates admin credentials against environment variables.
   * No database involved — credentials are dynamic via .env.
   * 
   * @returns JWT Bearer Token on success
   * @throws AppError(401) on invalid credentials
   */
  login(username: string, password: string): string {
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      throw new AppError(401, "Username atau password salah.");
    }

    const token = jwt.sign(
      { username, role: "admin" as const },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return token;
  }
}
