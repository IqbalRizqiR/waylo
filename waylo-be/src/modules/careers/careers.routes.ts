import {Router} from "express";
import {idParamSchema} from "@waylo/shared";
import {careerController} from "./careers.controller";
import {authenticate} from "../../middleware/auth";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate);
router.get("/", careerController.list);
router.get("/:id", validate({params: idParamSchema}), careerController.getById);

export {router as careerRoutes};
