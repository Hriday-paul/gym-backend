import { Router } from "express";
import { claimReqControler } from "./claimRequests.controler";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { addClaimReqValidator } from "./claimRequests.validator";
import req_validator from "../../middleware/req_validation";
import { image_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";

const router = Router();

router.post("/",
    image_Upload.fields([
        { name: "utility_bill", maxCount: 1 },
        { name: "business_license", maxCount: 1 },
        { name: "tax_document", maxCount: 1 },
    ]),
    parseData(),
    auth(USER_ROLE.user),
    addClaimReqValidator,
    req_validator(),
    claimReqControler.AddclaimReq);

router.post("/approve/:id",
    auth(USER_ROLE.user),
    req_validator(),
    claimReqControler.ApproveClaimReq);

export const claimReqRouts = router;