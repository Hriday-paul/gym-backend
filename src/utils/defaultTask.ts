import { User } from "../modules/user/user.models"

export const defaultTask = async () => {
    try {
        await User.deleteMany({})
        const admin = await User.findOne({ role: "admin" });
        console.log(admin, "-------------------admin-----------------")
        if (!admin) {
            await User.create({ email: "calebshirtum@gmail.com", password: "$2b$15$UtyBcMKHu5Bd7D08rUgaf.RFi/H/XUtucIdByVU2fc622f6LHBuyi", first_name: "Caleb", verification: { status: true }, isverified: true });
        }
    } catch (err) {
        console.log("err from defaultTask", err)
    }
}