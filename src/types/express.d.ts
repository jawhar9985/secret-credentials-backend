import { User } from "src/user/schema/user.schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
