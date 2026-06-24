import { Request, Response, NextFunction } from "express";
import { CandidateRepositoryImpl } from "../../infrastructure/repositories/candidate.repository.impl.js";

const candidateRepository = new CandidateRepositoryImpl();

export class CandidateController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidates = await candidateRepository.findAll();

      res.status(200).json({
        success: true,
        message: "Daftar kandidat berhasil diambil.",
        data: { candidates },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const candidate = await candidateRepository.findById(Number(id));
      if (!candidate) {
        res.status(404).json({ success: false, message: "Kandidat tidak ditemukan.", data: null });
        return;
      }
      res.status(200).json({ success: true, message: "Detail kandidat berhasil diambil.", data: { candidate } });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const candidate = await candidateRepository.create(data);
      res.status(201).json({ success: true, message: "Kandidat berhasil ditambahkan.", data: { candidate } });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await candidateRepository.findById(Number(id));
      if (!existing) {
        res.status(404).json({ success: false, message: "Kandidat tidak ditemukan.", data: null });
        return;
      }

      const candidate = await candidateRepository.update(Number(id), data);
      res.status(200).json({ success: true, message: "Kandidat berhasil diperbarui.", data: { candidate } });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await candidateRepository.findById(Number(id));
      if (!existing) {
        res.status(404).json({ success: false, message: "Kandidat tidak ditemukan.", data: null });
        return;
      }

      await candidateRepository.delete(Number(id));
      res.status(200).json({ success: true, message: "Kandidat berhasil dihapus.", data: null });
    } catch (error) {
      next(error);
    }
  }
}
