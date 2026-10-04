import {Router} from "express";
import {skillController} from "./skills.controller";
import {authenticate} from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", skillController.list);

export {router as skillRoutes};
