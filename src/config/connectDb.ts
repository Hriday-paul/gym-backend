import mongoose from "mongoose";
import config from ".";


const connectDb = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(config.database_url!, {
            dbName: 'forager'
        });

        console.log(`DB Running On ${mongoose.connection.host}`);

    } catch (error) {
        process.exit(1);
    }
};

export default connectDb;