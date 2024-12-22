import { arg } from "nexus";
import { TransactionType, generateID } from "../../utils";
import { productGetOrError, product_quantity_updown } from "../product";

// ****************************************************************************************************
export const invoices_get = async (tr: TransactionType, args) => {
}
export const invoice_create = async (tr: TransactionType, type: string, employeeId: string): Promise<string> => {
    if (type != INVOICE_TYPES.PURCHASE && type != INVOICE_TYPES.SALE && type != INVOICE_TYPES.SALE_GR && type != INVOICE_TYPES.LOSS) throw new Error('invoice type not match');
    const r = await tr.invoices.create({
        data: {
            id: generateID(type + "_invalid_"),
            type: type,
            employeeId: employeeId
        }
    })
    return r.id
}
export const invoice_update = async (tr: TransactionType, id: string, args: invoice_update_type): Promise<boolean> => {
    const invoice = await invoiceGetOrError(tr, id);
    if (invoice.validation == true) throw new Error('invoice is validated.');
    // 
    args.money_stamp = args.money_stamp ?? invoice.money_stamp;
    if (args.money_stamp < 0) throw new Error("money_stamp < 0")
    // 
    args.money_tax = args.money_tax ?? invoice.money_tax;
    if (args.money_tax < 0) throw new Error("money_tax < 0")
    // 
    args.money_paid = args.money_paid ?? invoice.money_paid;
    if (args.money_paid < 0) throw new Error("money_paid < 0")
    // 
    const money_net = (await tr.i_products.aggregate({ _sum: { money_calc: true }, where: { invoiceId: id } }))._sum.money_calc ?? 0;
    const money_calc = money_net + args.money_stamp + args.money_tax;
    const money_unpaid = money_calc - args.money_paid

    if (args.money_paid > money_calc) throw new Error("money_paid > money_calc")
    if (money_unpaid > money_calc) throw new Error("money_unpaid > money_calc")


    await tr.invoices.update({
        where: { id: id }, data: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            description: args.description,
            money_stamp: args.money_stamp,
            money_tax: args.money_tax,
            money_paid: args.money_paid,
            money_net: money_net,
            money_calc: money_calc,
            money_unpaid: money_unpaid,
        }
    })
    return true
}
export const invoice_update_prudect = async (tr: TransactionType, args: invoice_update_prudect_type): Promise<boolean> => {
    if (args?.quantity < 0) throw new Error('quantity < 0.');
    const invoice = await invoiceGetOrError(tr, args.invoiceId);
    if (invoice.validation == true) throw new Error('invoice is validated.');
    const product = await productGetOrError(tr, args.prudectId);
    const ip_exist = await tr.i_products.findFirst({ where: { invoiceId: args.invoiceId, productId: args.prudectId } })

    if (ip_exist) {
        const money_unite = (args.money_unite ?? ip_exist.money_unite);
        const quantity = (args.quantity ?? ip_exist.quantity + 1);
        const money_calc = (money_unite * quantity);
        // 
        if (quantity > 0) {
            await tr.i_products.updateMany({
                where: { invoiceId: args.invoiceId, productId: args.prudectId },
                data: {
                    // invoiceId: args.invoiceId,
                    // productId: args.prudectId,
                    description: args.description,
                    money_unite: money_unite,
                    quantity: quantity,
                    money_calc: money_calc,
                }
            })
        } else {
            await tr.i_products.deleteMany({
                where: { invoiceId: args.invoiceId, productId: args.prudectId }
            })
        }
    } else {
        let defult_money_unite: number = 0;
        if (invoice.type == INVOICE_TYPES.SALE) defult_money_unite = product.money_selling;
        else if (invoice.type == INVOICE_TYPES.SALE_GR) defult_money_unite = product.money_selling_gr;
        else if (invoice.type == INVOICE_TYPES.PURCHASE) defult_money_unite = product.money_purchase;
        else if (invoice.type == INVOICE_TYPES.LOSS) defult_money_unite = product.money_purchase;

        const money_unite = args.money_unite ?? defult_money_unite;
        const quantity = (args.quantity ?? 1);
        const money_calc = (money_unite * quantity);
        if (quantity > 0) {
            await tr.i_products.create({
                data: {
                    invoiceId: args.invoiceId,
                    productId: args.prudectId,
                    description: args.description,
                    money_unite: money_unite,
                    quantity: quantity,
                    money_calc: money_calc
                }
            })
        }
    }
    // await invoice_update(tr, args.invoiceId, {})
    return true
}
export const invoice_update_validation = async (tr: TransactionType, invoiceId: string, validationNew: boolean): Promise<string> => {
    const invoice = await invoiceGetOrError(tr, invoiceId);
    // 
    const validationOld = invoice.validation;
    const invoiceType = invoice.type;
    // 
    if (validationNew == true && validationOld == true) throw new Error('invoice already validated.');
    if (validationNew == false && validationOld == false) throw new Error('invoice already invalidate.');
    // 
    let idOut;
    if (invoiceType == INVOICE_TYPES.PURCHASE) {
        if (validationNew == true && validationOld == false) {
            // to valid
            const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
            for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, ip[i].quantity)
            idOut = await tr.invoices.update({ where: { id: invoiceId }, data: { id: generateID(invoiceType + "_valid_"), validation: true } })
        } else if (validationNew == false && validationOld == true) {
            // to invalid
            const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
            for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, - ip[i].quantity)
            idOut = await tr.invoices.update({ where: { id: invoiceId }, data: { id: generateID(invoiceType + "_invalid_"), validation: false } })
        }
    } else if (invoiceType == INVOICE_TYPES.SALE || invoiceType == INVOICE_TYPES.SALE_GR || invoiceType == INVOICE_TYPES.LOSS) {
        if (validationNew == true && validationOld == false) {
            // to valid
            const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
            for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, -ip[i].quantity)
            idOut = await tr.invoices.update({ where: { id: invoiceId }, data: { id: generateID(invoiceType + "_valid_"), validation: true } })
        } else if (validationNew == false && validationOld == true) {
            // to invalid
            const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
            for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, ip[i].quantity)
            idOut = await tr.invoices.update({ where: { id: invoiceId }, data: { id: generateID(invoiceType + "_invalid_"), validation: false } })
        }
    }
    else {
        throw new Error('invoice type not recognized');
    }
    return idOut
}
export const invoice_delete = async (tr: TransactionType, invoiceId: string): Promise<boolean> => {
    const invoice = await invoiceGetOrError(tr, invoiceId);
    if (invoice.validation == true) throw new Error('invoice is validated.');
    // 
    await tr.invoices.delete({ where: { id: invoiceId } })
    return true
}
export const invoiceGetOrError = async (tr: TransactionType, invoiceId: string) => {
    if (invoiceId == undefined) throw new Error('invoice id is required');
    const invoice = await tr.invoices.findUnique({ where: { id: invoiceId } })
    if (!invoice) throw new Error(`invoice id ${invoiceId} not exist .`);
    return invoice
}
// **************************************************************************************************** 
export type invoice_update_type = {
    id?: string,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    money_tax?: number,
    money_stamp?: number,
    money_paid?: number,
}
export type invoice_update_prudect_type = {
    invoiceId: string,
    prudectId: string, description?: string,
    money_unite?: number,
    quantity?: number
}
export const INVOICE_TYPES = {
    PURCHASE: "PURCHASE",
    SALE: "SALE",
    SALE_GR: "SALE_GR",
    LOSS: "LOSS"
}
