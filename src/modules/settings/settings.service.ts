import { ISettings } from "./settings.interface";
import { Setting } from "./settings.model";

const singleSettingItem = async (key: string) => {
    const data = await Setting.findOne({ key }).select("key value")
    return data
}

const updateSettingItem = async (payload: ISettings) => {
    const { key, value } = payload

    const result = await Setting.updateOne({ key }, {value}, {upsert : true})

    return result
}

export const settingService = {
    singleSettingItem,
    updateSettingItem
}