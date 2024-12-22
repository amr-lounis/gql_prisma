import { TransactionType } from "../../utils";

// **************************************************************************************************** 
export const settings_get = async (tr: TransactionType) => {
    return await tr.settings.findMany({});
}
export const setting_get = async (tr: TransactionType, key: string): Promise<string> => {
    const r = await tr.settings.findUnique({
        where: { key: key }
    })
    return r.value
}
export const setting_set = async (tr: TransactionType, key: string, value: string): Promise<boolean> => {
    const exist = await tr.settings.findFirst({ select: { key: true }, where: { key: key } }) ? true : false
    if (!exist) await tr.settings.create({ data: { key: key, value: value } })
    else await tr.settings.update({ where: { key: key }, data: { key: key, value: value } })
    return true
}
// **************************************************************************************************** 