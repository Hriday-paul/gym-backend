import { IMatReminderTemplate } from "./reminder.interface"
import { MatReminderTemplate } from "./reminder.model"

const updateReminderTemplate = async (payload: IMatReminderTemplate) => {

    await MatReminderTemplate.deleteMany({});

    // const result = await MatReminderTemplate.updateOne({ name: payload?.name }, { ...payload, name: "template" }, { upsert: true })

    return  {
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