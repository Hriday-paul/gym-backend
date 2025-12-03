import { User } from "../modules/user/user.models"

export const defaultTask = async () => {
    try {
        await User.updateOne({ email: "admin@gmail.com" }, { email: "calebshirtum@gmail.com" });
    } catch (err) {
        console.log("err from defaultTask", err)
    }
}