import { TransactionType } from '../../utils';
// **************************************************************************************************** operation
export const operations_get = async (tr: TransactionType): Promise<string[]> => {
    const r = await tr.u_operations.findMany({});
    return r.map((x) => x.id)
}
export const operation_create = async (tr: TransactionType, id: string): Promise<boolean> => {
    await tr.u_operations.create({ data: { id: id } })
    return true
}
export const operation_update = async (tr: TransactionType, id: string, idNew: string): Promise<boolean> => {
    await tr.u_operations.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const operation_delete = async (tr: TransactionType, id: string): Promise<boolean> => {
    await tr.u_operations.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** role
export const roles_get = async (tr: TransactionType,): Promise<string[]> => {
    const r = await tr.u_roles.findMany({ select: { id: true } });
    return r.map((x) => x.id)
}
export const role_create = async (tr: TransactionType, id: string): Promise<boolean> => {
    await tr.u_roles.create({ data: { id: id } })
    return true
}
export const role_update = async (tr: TransactionType, id: string, idNew: string): Promise<boolean> => {
    await tr.u_roles.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const role_delete = async (tr: TransactionType, id: string): Promise<boolean> => {
    await tr.u_roles.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** role_authorization
export const authorizations_get = async (tr: TransactionType, roleId: string) => {
    return await tr.u_roles_operations.findMany({ where: { roleId: roleId } })
}
export const authorizations_all_get = async (tr: TransactionType,) => {
    return await tr.u_roles_operations.findMany({})
}
export const role_authorization_set = async (tr: TransactionType, roleId: string, operationId: string, value: boolean): Promise<boolean> => {
    const exist = await tr.u_roles_operations.findFirst({ where: { operationId: operationId, roleId: roleId } }) ? true : false
    if (!exist) {
        await tr.u_roles_operations.create({
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    else {
        await tr.u_roles_operations.updateMany({
            where: {
                operationId: operationId,
                roleId: roleId
            },
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    return true;
}
// **************************************************************************************************** 