import { Request, Response, NextFunction } from "express";
import { AdminUseCase } from "../../usecases/admin.usecase.js";
import { TokenRepositoryImpl } from "../../infrastructure/repositories/token.repository.impl.js";

const adminUseCase = new AdminUseCase(new TokenRepositoryImpl());

export class AdminController {
  static async generateTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount } = req.body;
      const tokens = await adminUseCase.generateTokens(amount);

      res.status(201).json({
        success: true,
        message: `Berhasil membuat ${tokens.length} token voting.`,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnusedTokens(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await adminUseCase.getUnusedTokens();

      res.status(200).json({
        success: true,
        message: `Ditemukan ${tokens.length} token yang belum digunakan.`,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "ID token tidak valid.",
          data: null,
        });
        return;
      }

      await adminUseCase.deleteToken(id);

      res.status(200).json({
        success: true,
        message: "Token berhasil dihapus.",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
