import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {config} from "./config";
import {authRoutes} from "./modules/auth/auth.routes";
import {jobRoutes} from "./modules/jobs/jobs.routes";
import {applicationRoutes} from "./modules/applications/applications.routes";
import {learnerRoutes} from "./modules/learner/learner.routes";
import {companyRoutes} from "./modules/company/company.routes";
import {careerRoutes} from "./modules/careers/careers.routes";
import {skillRoutes} from "./modules/skills/skills.routes";
import {courseRoutes} from "./modules/courses/courses.routes";
import {h5pRoutes} from "./modules/h5p/h5p.routes";
import {paymentRoutes} from "./modules/payments/payments.routes";
import {projectRoutes} from "./modules/projects/projects.routes";
import {mentorRoutes} from "./modules/mentor/mentor.routes";
import {adminRoutes} from "./modules/admin/admin.routes";
import {errorHandler, notFoundHandler} from "./middleware/error-handler";
import {metricsMiddleware} from "./middleware/metrics.middleware";
import {register} from "./monitoring/metrics";

export function createApp() {
  const app = express();

  app.use(metricsMiddleware);

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({limit: "1mb"}));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({data: {status: "ok"}, error: null});
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  app.use("/auth", authRoutes);
  app.use("/jobs", jobRoutes);
  app.use("/applications", applicationRoutes);
  app.use("/learner", learnerRoutes);
  app.use("/company", companyRoutes);
  app.use("/careers", careerRoutes);
  app.use("/skills", skillRoutes);
  app.use("/courses", courseRoutes);
  app.use("/h5p", h5pRoutes);
  app.use("/payments", paymentRoutes);
  app.use("/projects", projectRoutes);
  app.use("/mentor", mentorRoutes);
  app.use("/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}