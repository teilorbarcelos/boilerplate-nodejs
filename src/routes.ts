import { Request, Response, Router } from "express";

import { UserController } from "./controllers/userController";
import { onlyAuth } from "./middlewares";

const router = Router();

router.get("/", (request: Request, response: Response) => {
  const message = {
    message:
      "API created to Personal portfolio and blog Author: Teilor Souza Barcelos",
    contact: "https://teilorwebdev.vercel.app/",
  };
  return response.json(message);
});

// User routes
router.post("/user/authenticate", new UserController().handleAuth);
router.post("/user/update", onlyAuth, new UserController().handleUpdate);

export { router };
