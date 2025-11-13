import { Router } from "express";
import { favouriteController } from "./favourites.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { addFavouriteValidator } from "./favourites.validator";
import req_validator from "../../middleware/req_validation";


const router = Router();

router.get("/", auth(USER_ROLE.user), favouriteController.myAllFavourites);
router.delete("/:id", auth(USER_ROLE.user), favouriteController.deleteFavourite);
router.post("/",
    auth(USER_ROLE.user),
    addFavouriteValidator,
    req_validator(),
    favouriteController.addFavourite);

export const favouriteRouts = router;