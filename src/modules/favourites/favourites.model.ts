import { model, Schema } from 'mongoose';
import { IFavourites } from './favourites.interface';


const FavouriteSchema: Schema<IFavourites> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, required: true, ref : "users" },
        gym: { type: Schema.Types.ObjectId, required: true, ref : "gyms" },
    },
    { timestamps: true },
);

export const Favorites = model<IFavourites>('favourites', FavouriteSchema);