import { Request, Response } from "express";
import { UserService } from "@/services/userServices";

class UserController {
  async handleAuth(request: Request, response: Response) {
    const { email, password } = request.body;

    const service = new UserService();

    try {
      const user = await service.authenticate({
        email,
        password,
      });

      return response.json(user);
    } catch (error) {
      return response.json({ error: error.message });
    }
  }

  async handleRefreshToken(request: Request, response: Response) {
    const { email, password } = request.body;

    const service = new UserService();

    try {
      const user = await service.authenticate({
        email,
        password,
      });

      return response.json(user);
    } catch (error) {
      return response.json({ error: error.message });
    }
  }

  async handleUpdate(request: Request, response: Response) {
    const { user_id, name, password, password2 } = request.body;
    const id = request.id;

    const service = new UserService();

    if (password !== password2) {
      return response.json({ error: "The passwords dont match!" });
    }

    try {
      const user = await service.update({
        id: user_id ? user_id : id,
        name,
        password,
      });

      return response.json(user);
    } catch (error) {
      return response.json({ error: error.message });
    }
  }
}

export { UserController };
