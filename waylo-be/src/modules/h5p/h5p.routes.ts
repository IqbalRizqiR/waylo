import {Router, type Request, type Response} from "express";
import express from "express";
import {existsSync} from "node:fs";
import {h5pService} from "./h5p.service";
import {ok} from "../../lib/http";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";

const router = Router();

// Upload an .h5p package (admin or mentor)
// Accepts raw binary body up to 50MB
router.post(
  "/upload",
  authenticate,
  requireRole("admin", "mentor"),
  express.raw({type: ["application/zip", "application/x-h5p", "application/octet-stream"], limit: "50mb"}),
  async (req: Request, res: Response, next) => {
    try {
      const buffer = req.body as Buffer;
      if (!buffer || buffer.length === 0) {
        res.status(400).json({data: null, error: {code: "empty_body", message: "File H5P kosong."}});
        return;
      }
      const result = await h5pService.extractPackage(buffer);
      res.json(ok(result));
    } catch (err) {
      next(err);
    }
  },
);

// Demo content JSON endpoint (public to authenticated users)
router.get("/demo/:slug", authenticate, (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  res.json(ok(h5pService.getDemoContent(slug)));
});

// Serve static H5P content files
router.use("/content/:id", (req: Request, res: Response) => {
  try {
    const contentId = req.params.id as string;
    const subPath = req.path.replace(/^\//, "") || "h5p.json";
    const filePath = h5pService.getContentFilePath(contentId, subPath);

    if (!existsSync(filePath)) {
      res.status(404).json({data: null, error: {code: "not_found", message: "File tidak ditemukan."}});
      return;
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(403).json({data: null, error: {code: "forbidden", message: "Akses ditolak."}});
  }
});

export {router as h5pRoutes};
