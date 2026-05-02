import { User } from "../modules/user/user.models"

export const defaultTask = async () => {
    try {
        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            await User.create({
                email: "calebshirtum@gmail.com",
                password: "$2b$15$UtyBcMKHu5Bd7D08rUgaf.RFi/H/XUtucIdByVU2fc622f6LHBuyi",
                first_name: "Caleb",
                role: "admin",  // ← you were missing this!
                verification: { status: true },
                isverified: true
            });
            console.log("Admin created successfully");
        } else {
            console.log("Admin already exists");
        }
    } catch (err) {
        console.log("err from defaultTask", err)
    }
}