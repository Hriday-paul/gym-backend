import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { gymControler } from "./gym.controler";
import { allMatsvalidator, deleteGymImageValidator, gymAddValidator, gymUpdateValidator, nearGymValidator } from "./gym.validator";
import { image_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";

const router = Router();

router.post(
    '/',
    auth(USER_ROLE.user),
    image_Upload.fields([
         { name: "utility_bill", maxCount : 1 },
        { name: "business_license", maxCount : 1 },
        { name: "tax_document", maxCount : 1 },
        { name: "images" },
    ]),
    parseData(),
    gymAddValidator,
    req_validator(),
    gymControler.AddGymByUser,
);
router.post(
    '/admin',
    auth(USER_ROLE.admin),
    image_Upload.array('images'),
    parseData(),
    gymAddValidator,
    req_validator(),
    gymControler.AddGymByAdmin,
);

router.get("/", auth(USER_ROLE.admin), gymControler.allGyms);

router.get("/my-gyms",
    auth(USER_ROLE.user),
    gymControler.MyGyms
)
router.get("/mats",
    allMatsvalidator,
    req_validator(),
    auth(USER_ROLE.user),
    gymControler.allMats
)
router.get("/mats/near-me",
    nearGymValidator,
    req_validator(),
    auth(USER_ROLE.user),
    gymControler.nearMeMats
)

router.patch(
    '/:id',
    auth(USER_ROLE.user, USER_ROLE.admin),
    image_Upload.array('images'),
    parseData(),
    gymUpdateValidator,
    req_validator(),
    gymControler.updateGym,
);

router.get("/:id",
    auth(USER_ROLE.user),
    gymControler.GymDetails
)

router.delete("/gym-image",
    deleteGymImageValidator,
    req_validator(),
    auth(USER_ROLE.user, USER_ROLE.admin),
    gymControler.deleteGymImage
)

router.delete("/:id",
    auth(USER_ROLE.user, USER_ROLE.admin),
    gymControler.DeleteGym
)

export const gymRoutes = router;