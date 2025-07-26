import express from "express";
import authUser from "../middleware/authUser.js";
import { getMessages, getUserSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users" , authUser ,getUserSidebar);
messageRouter.get("/:id" , authUser ,getMessages);
messageRouter.put("/mark/:id" , authUser ,markMessageAsSeen);
messageRouter.post("/send/:id" , authUser ,sendMessage);

export default messageRouter;

