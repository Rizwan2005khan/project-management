import express from "express";
import { createFieldDefinition, updateFieldValue, deleteFieldDefinition } from "../controllers/customFieldController.js";

const customFieldRouter = express.Router();

customFieldRouter.post("/definition", createFieldDefinition);
customFieldRouter.post("/value", updateFieldValue);
customFieldRouter.delete("/definition/:id", deleteFieldDefinition);

export default customFieldRouter;
