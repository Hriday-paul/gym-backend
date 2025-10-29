import moment from "moment";
import { User } from "../user/user.models";


const userChart = async (query: Record<string, any>) => {
    const userYear = query?.JoinYear ?? moment().year();
    const startOfUserYear = moment().year(userYear).startOf('year');
    const endOfUserYear = moment().year(userYear).endOf('year');

    const monthlyUser = await User.aggregate([
        {
            $match: {
                status: 1,
                createdAt: {
                    $gte: startOfUserYear.toDate(),
                    $lte: endOfUserYear.toDate(),
                },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' } },
                total: { $sum: 1 }, // Corrected to count the documents
            },
        },
        {
            $sort: { '_id.month': 1 },
        },
    ]);

    // Format monthly income to have an entry for each month
    const formattedMonthlyUsers = Array.from({ length: 12 }, (_, index) => ({
        month: moment().month(index).format('MMM'),
        total: 0,
    }));

    monthlyUser.forEach(entry => {
        formattedMonthlyUsers[entry._id.month - 1].total = Math.round(entry.total);
    });
    return formattedMonthlyUsers
}

const earningChart = async (query: Record<string, any>) => {
    return null;
}

const countData = async () => {
    const totalUsers = await User.countDocuments({ status: 1 });

    return { totalUsers: totalUsers.toFixed()}
}

export const dashboardService = {
    userChart,
    earningChart,
    countData
}