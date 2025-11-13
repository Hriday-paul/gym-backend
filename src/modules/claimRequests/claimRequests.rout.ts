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
        { name: "utility_bill" },
        { name: "business_license" },
        { name: "tax_document" },
    ]),
    parseData(),
    auth(USER_ROLE.user),
    addClaimReqValidator,
    req_validator(),
    claimReqControler.AddclaimReq);


router.get("/",
    auth(USER_ROLE.admin),
    claimReqControler.allClaims);

router.post("/approve/:id",
    auth(USER_ROLE.user),
    claimReqControler.ApproveClaimReq);

router.get("/stats",
    auth(USER_ROLE.admin),
    claimReqControler.claimStats);


export const claimReqRouts = router;