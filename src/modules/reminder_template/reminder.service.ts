import { IMatReminderTemplate } from "./reminder.interface"
import { MatReminderTemplate } from "./reminder.model"

const updateReminderTemplate = async (payload: IMatReminderTemplate) => {

    const result = await MatReminderTemplate.updateOne({ name: "template" }, { $set: { ...payload, name: "template" } }, { upsert: true })

    return result ?? {
        title: "",
        message: "",
        hour: null
    }
}

const getReminderTemplate = async () => {

    const result = await MatReminderTemplate.findOne({ name: "template" })

    return result
}

export const reminderTemplateService = {
    updateReminderTemplate,
    getReminderTemplate
}