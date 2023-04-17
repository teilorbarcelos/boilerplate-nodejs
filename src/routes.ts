import { Request, Response, Router } from "express";
import { UserController } from "./controllers/userController";
import { onlyAuth } from "./middlewares/onlyAuth";

const router = Router();

// User routes
router.post("/user/authenticate", new UserController().handleAuth);
router.post("/user/token", new UserController().handleRefreshToken);
router.post("/user/update", new UserController().handleUpdate);

export { router };
