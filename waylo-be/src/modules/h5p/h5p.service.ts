import path from "node:path";
import fs from "node:fs/promises";
import {existsSync} from "node:fs";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import crypto from "node:crypto";
import {HttpError} from "../../lib/http";

const execFileAsync = promisify(execFile);

const STORAGE_DIR = path.resolve(process.cwd(), "storage", "h5p");

async function ensureStorageDir(): Promise<void> {
  if (!existsSync(STORAGE_DIR)) {
    await fs.mkdir(STORAGE_DIR, {recursive: true});
  }
}

export const h5pService = {
  async extractPackage(buffer: Buffer): Promise<{contentId: string; contentPath: string}> {
    await ensureStorageDir();

    const contentId = crypto.randomUUID();
    const targetDir = path.join(STORAGE_DIR, contentId);
    const tempZipPath = path.join(STORAGE_DIR, `${contentId}.zip`);

    try {
      await fs.writeFile(tempZipPath, buffer);
      await fs.mkdir(targetDir, {recursive: true});

      // Use system unzip
      await execFileAsync("unzip", ["-q", "-o", tempZipPath, "-d", targetDir]);

      // Verify h5p.json exists
      const h5pJsonPath = path.join(targetDir, "h5p.json");
      if (!existsSync(h5pJsonPath)) {
        await fs.rm(targetDir, {recursive: true, force: true});
        throw HttpError.badRequest(
          "Paket H5P tidak valid: h5p.json tidak ditemukan.",
          "invalid_h5p_package",
        );
      }

      return {
        contentId,
        contentPath: `/h5p/content/${contentId}`,
      };
    } finally {
      // Clean up temp zip
      if (existsSync(tempZipPath)) {
        await fs.unlink(tempZipPath).catch(() => undefined);
      }
    }
  },

  getContentFilePath(contentId: string, relativePath: string): string {
    // Sanitize to prevent path traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
    const fullPath = path.join(STORAGE_DIR, contentId, safePath);

    // Verify it stays inside targetDir
    if (!fullPath.startsWith(path.join(STORAGE_DIR, contentId))) {
      throw HttpError.forbidden("Akses path tidak diizinkan.", "path_traversal");
    }

    return fullPath;
  },

  // Fallback demo content for when no real H5P packages are uploaded yet
  getDemoContent(lessonSlug: string) {
    return {
      title: lessonSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: "Konten interaktif demo untuk pembelajaran.",
      h5p: {
        title: "Demo Interaction",
        language: "id",
        mainLibrary: "H5P.CoursePresentation",
      },
      content: {
        presentation: {
          slides: [
            {
              elements: [
                {
                  type: "text",
                  text: `<h2>Selamat Datang di Pembelajaran</h2><p>Ini adalah slide pertama materi <strong>${lessonSlug}</strong>. Pelajari konsep utama sebelum melanjutkan ke kuis interaktif.</p>`,
                },
              ],
            },
            {
              elements: [
                {
                  type: "summary",
                  title: "Rangkuman Materi",
                  points: [
                    "Pahami konsep dasar sebelum menulis kode",
                    "Gunakan standar industri untuk penulisan kode yang bersih",
                    "Uji setiap fitur secara terisolasi sebelum integrasi",
                  ],
                },
              ],
            },
          ],
        },
      },
    };
  },
};
