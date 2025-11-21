import express from "express";
import { sendEmail} from "../../emailController/sendController.js";
import { getInboxEmails } from "../../emailController/receiveEmailController.js";
import { markEmailAsRead } from "../../emailController/markReadController.js";
import { getSentEmails } from "../../emailController/sentEmailController.js";
import { getDraftEmails } from "../../emailController/draftEmailController.js";
import { getTrashEmails } from "../../emailController/trashEmailController.js";
import { moveToTrash, restoreFromTrash, permanentlyDelete } from "../../emailController/deleteEmailController.js";


const router = express.Router();

router.post("/send", sendEmail);
router.get("/inbox", getInboxEmails);
router.put('/mark-as-read/:uid', markEmailAsRead);
router.get("/sent", getSentEmails);
router.get("/drafts", getDraftEmails);
router.get("/trash", getTrashEmails);

// inbox delete -> move to trash
router.delete("/delete/:uid", moveToTrash); // ?folder=inbox

// restore and perm delete from trash
router.post("/trash/restore/:uid", restoreFromTrash);
router.delete("/trash/permanent/:uid", permanentlyDelete);



export default router;
