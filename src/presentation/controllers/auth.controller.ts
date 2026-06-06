import { Request, Response, NextFunction } from "express";
import { AuthUseCase } from "../../usecases/auth.usecase.js";

const authUseCase = new AuthUseCase();

export class AuthController {
  static login(req: Request, res: Response, next: NextFunction): void {
    try {
      const { username, password } = req.body;
      const token = authUseCase.login(username, password);

      res.status(200).json({
        success: true,
        message: "Login berhasil.",
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  }
}
