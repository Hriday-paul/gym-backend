import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { gymControler } from "./gym.controler";
import { deleteGymImageValidator, gymAddValidator, gymUpdateValidator, nearGymValidator } from "./gym.validator";
import { image_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";

const router = Router();

router.post(
    '/',
    auth(USER_ROLE.user),
    image_Upload.array('images'),
    parseData(),
    gymAddValidator,
    req_validator(),
    gymControler.AddGymByUser,
);

router.get("/my-gyms",
    auth(USER_ROLE.user),
    gymControler.MyGyms
)
router.get("/mats",
    // nearGymValidator,
    // req_validator(),
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
    auth(USER_ROLE.user),
    image_Upload.array('image'),
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
    auth(USER_ROLE.user),
    gymControler.deleteGymImage
)

router.delete("/:id",
    auth(USER_ROLE.user),
    gymControler.DeleteGym
)

export const gymRoutes = router;