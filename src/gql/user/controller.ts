import { MyToken, TransactionType, toPage } from "../../utils"
// **************************************************************************************************** 
export const user_authentication = async (tr: TransactionType, id: string, password: string): Promise<string> => {
    try {
        var u = await tr.users.findFirst({ where: { id: id, password: password } })
        return MyToken.Token_Create(u.id, u.roleId)
    } catch (error) {
        return ""
    }
}
export const user_authentication_renewal = (id: string, roleId: string): string => {
    try {
        return MyToken.Token_Create(id, roleId)
    } catch (error) {
        return ""
    }
}
export const user_role_get = async (tr: TransactionType, id: string): Promise<string> => {
    const user = await userGetOrError(tr, id)
    return user?.roleId
}
export const user_photo_get = async (tr: TransactionType, id: string): Promise<string> => {
    const p = await tr.u_photos.findUnique({ where: { userId: id } },);
    if (!p) throw new Error('not exist');
    return p?.photo?.toString() ?? ""
}
export const users_get = async (tr: TransactionType, args: ArgsUserQ) => {
    args.filter_id = args.filter_id ?? ""
    const itemsCountAll = (await tr.users.aggregate({
        _count: { id: true }, where: { // -------------------------------------------------- where for 1
            id: { contains: args.filter_id, equals: args.id },
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await tr.users.findMany({
        orderBy: { createdAt: 'desc' }, where: {  // -------------------------------------------------- where for 2
            id: { contains: args.filter_id, equals: args.id },
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }, skip: p.itemsSkip, take: p.itemsTake
    })

    return {
        allItemsCount: itemsCountAll,
        allPagesCount: p.allPagesCount,
        itemsSkip: p.itemsSkip,
        itemsTake: p.itemsTake,
        pageNumber: p.pageNumber,
        itemsCount: items.length,
        items: items
    }
}
export const user_create = async (tr: TransactionType, args: ArgsUserM): Promise<boolean> => {
    if (args.id == undefined) throw new Error('id is required');
    if (args?.id?.length > 100) throw new Error('id length > 100');
    const r = await tr.users.create({ data: { id: args.id } });
    await tr.u_photos.create({ data: { userId: r.id, photo: Buffer.from("", 'utf8') } });
    await user_update(tr, args.id, args)
    return true;
}
export const user_update = async (tr: TransactionType, id: string, args: ArgsUserM): Promise<boolean> => {
    if (args?.id?.length > 100) throw new Error('id length > 100');
    await userGetOrError(tr, id)
    await tr.users.update({
        where: { id: id },
        data: {
            id: args.id,
            password: args.password,
            description: args.description,
            roleId: args.roleId,
            address: args.address,
            first_name: args.first_name,
            last_name: args.last_name,
            phone: args.phone,
            fax: args.fax,
            email: args.email,
        }
    });
    if (args.photo != undefined) {
        if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
        await tr.u_photos.update({ where: { userId: id }, data: { photo: photpBytes } });
    }
    return true;
}
export const user_delete = async (tr: TransactionType, id: string): Promise<boolean> => {
    await userGetOrError(tr, id)
    await tr.users.delete({ where: { id: id } })
    return true;
}
export const userGetOrError = async (tr: TransactionType, userId: string) => {
    if (userId == undefined) throw new Error('user id is required');
    const user = await tr.users.findUnique({ where: { id: userId } })
    if (!user) throw new Error(`user id : ${userId} is not exist`);
    return user
}
// **************************************************************************************************** 
export type ArgsUserQ = {
    id?: string,
    userId?: string,
    password?: string,
    filter_id?: string,
    filter_description?: string,
    filter_update_gte?: string,
    filter_update_lte?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    itemsTake?: number,
    itemsSkip?: number,
    pageNumber?: number,
}

export type ArgsUserM = {
    id?: string,
    roleId?: string,
    password?: string,
    description?: string,
    address?: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    fax?: string,
    email?: string,
    photo?: string,
}