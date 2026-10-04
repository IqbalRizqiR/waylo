import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {courseService} from "./courses.service";

export const courseController = {
  async list(req: Request, res: Response) {
    const userId = req.auth?.id;
    res.json(ok(await courseService.list(userId)));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.auth?.id;
    res.json(ok(await courseService.getDetail(id, userId)));
  },

  async enroll(req: Request, res: Response) {
    const courseId = req.params.id as string;
    const userId = req.auth!.id;
    res.json(ok(await courseService.enroll(courseId, userId)));
  },

  async updateLessonProgress(req: Request, res: Response) {
    const courseId = req.params.id as string;
    const lessonId = req.params.lessonId as string;
    const userId = req.auth!.id;
    const {status} = req.body;
    res.json(ok(await courseService.updateProgress(courseId, lessonId, userId, status)));
  },
};
