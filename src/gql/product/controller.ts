import { TransactionType, toPage } from '../../utils';
// **************************************************************************************************** products
export const products_get = async (tr: TransactionType, args: ArgsProductQ) => {
    args.filter_id = args.filter_id ?? ""
    const itemsCountAll = (await tr.products.aggregate({
        _count: { id: true },
        where: {
            id: { contains: args.filter_id, equals: args.id },
            categorieId: args.categorieId,
            unityId: args.unityId,
            code: args.code,
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
            quantity: { gte: args.filter_quntity_gte, lte: args.filter_quntity_lte },
            date_alert: { gte: args.filter_date_alert_gte, lte: args.filter_date_alert_lte },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await tr.products.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
            id: { contains: args.filter_id, equals: args.id },
            categorieId: args.categorieId,
            unityId: args.unityId,
            code: args.code,
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
            quantity: { gte: args.filter_quntity_gte, lte: args.filter_quntity_lte },
            date_alert: { gte: args.filter_date_alert_gte, lte: args.filter_date_alert_lte },
        },
        skip: p.itemsSkip, take: p.itemsTake
    });
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
export const product_photo_get = async (tr: TransactionType, producId: string): Promise<string> => {
    const p = await tr.p_photos.findUnique({ where: { productId: producId } });
    if (!p) throw new Error(`producId:${producId} not exist`);
    return p?.photo?.toString() ?? ""
}
export const product_create = async (tr: TransactionType, args: ArgsProductType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('product id is required');
    const r = await tr.products.create({ data: { id: args.id } })
    await tr.p_photos.create({ data: { productId: r.id, photo: Buffer.from("", 'utf8') } });
    await product_update(tr, args.id, args)
    return true
}
export const product_update = async (tr: TransactionType, productId: string, args: ArgsProductType): Promise<boolean> => {
    const product = await productGetOrError(tr, productId);
    if (args.money_purchase < 0) throw new Error('money_purchase < 0');
    if (args.money_selling < 0) throw new Error('money_selling < 0');
    if (args.money_selling_gr < 0) throw new Error('money_selling_gr < 0');
    if (args.quantity < 0) throw new Error("quantity < 0)");

    await tr.products.update({
        where: {
            id: productId
        },
        data: {
            id: args.id,
            categorieId: args.categorieId,
            unityId: args.unityId,
            code: args.code,
            description: args.description,
            money_purchase: args.money_purchase,
            money_selling: args.money_selling,
            money_selling_gr: args.money_selling_gr,
            date_alert: args.date_alert,
            quantity_alert: args.quantity_alert,
            quantity: args.quantity,
        }
    });
    if (args.photo != undefined) {
        if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
        await tr.p_photos.update({ where: { productId: productId }, data: { photo: photpBytes } },);
    }
    return true
}
export const product_delete = async (tr: TransactionType, productId: string): Promise<boolean> => {
    await productGetOrError(tr, productId);
    await tr.products.delete({ where: { id: productId } })
    return true
}
export const product_quantity_updown = async (tr: TransactionType, productId: string, quantity: number): Promise<boolean> => {//if  (quantity < 0) reduire else add
    const product = await productGetOrError(tr, productId);
    await tr.products.update({ where: { id: productId }, data: { quantity: product.quantity + quantity } })
    const r2 = await tr.products.findUnique({ select: { quantity: true }, where: { id: productId } })
    if (r2.quantity < 0) throw new Error('product quantity < 0 .');
    return true
}
export const productGetOrError = async (tr: TransactionType, productId: string) => {
    if (productId == undefined) throw new Error('product id is required');
    const product = await tr.products.findUnique({ where: { id: productId } })
    if (!product) throw new Error(`product id "${product}" not exist .`);
    return product
}
// **************************************************************************************************** units
export const product_units_get = async (tr: TransactionType,): Promise<string[]> => {
    const r = await tr.p_units.findMany({});
    return r.map((x) => x.id)
}
export const product_unity_create = async (tr: TransactionType, unityId: string): Promise<boolean> => {
    await tr.p_units.create({ data: { id: unityId } })
    return true
}
export const product_unity_update = async (tr: TransactionType, unityId: string, unityIdNew: string): Promise<boolean> => {
    await tr.p_units.update({ where: { id: unityId }, data: { id: unityIdNew } })
    return true
}
export const product_unity_delete = async (tr: TransactionType, unityId: string): Promise<boolean> => {
    await tr.p_units.delete({ where: { id: unityId } })
    return true
}
// **************************************************************************************************** categories
export const product_categories_get = async (tr: TransactionType,): Promise<string[]> => {
    const r = await tr.p_categories.findMany({});
    return r.map((x) => x.id)
}
export const product_categorie_create = async (tr: TransactionType, categorieId: string): Promise<boolean> => {
    await tr.p_categories.create({ data: { id: categorieId } })
    return true
}
export const product_categorie_update = async (tr: TransactionType, categorieId: string, categorieIdNew: string): Promise<boolean> => {
    await tr.p_categories.update({ where: { id: categorieId }, data: { id: categorieIdNew } })
    return true
}
export const product_categorie_delete = async (tr: TransactionType, categorieId: string): Promise<boolean> => {
    await tr.p_categories.delete({ where: { id: categorieId } })
    return true
}
// **************************************************************************************************** 
export type ArgsProductType = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    description?: string,
    photo?: string,
    // 
    money_purchase?: number,
    money_selling?: number,
    money_selling_gr?: number,
    date_alert?: string,
    quantity_alert?: number,
    quantity?: number,
}
// **************************************************************************************************** 
export type ArgsProductQ = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    // 
    filter_id: string,
    filter_description?: string,
    filter_update_gte?: string,
    filter_update_lte?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    filter_quntity_gte?: number,
    filter_quntity_lte?: number,
    filter_date_alert_gte?: string,
    filter_date_alert_lte?: string,
    // 
    pageNumber?: number,
    itemsTake?: number
}
// **************************************************************************************************** 