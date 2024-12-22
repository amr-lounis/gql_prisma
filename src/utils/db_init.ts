import { authorization_matrix } from "./authorization_matrix"
import { product_categorie_create, operation_create, product_create, role_create, todo_create, product_unity_create, user_create, setting_set, invoice_create, INVOICE_TYPES, invoice_update_prudect, invoice_update } from "../gql"
import { myLog, generateRandomString, generateRandomInt } from "./myFunc"
import { db } from "./db"

export const db_init = async (listOperationName: string[]) => {
    myLog(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'

    await init_roles([admin, employee]);
    await init_users([admin, employee]);
    await init_setting();
    await init_operations(listOperationName);
    await init_todo();
    await init_product();
    await init_invoice();

    // -------------------------------------------------- init autorisation matrix
    // init matrix roles
    await authorization_matrix.initMatrix()
    // admin set allow for all operation
    if (authorization_matrix.matrix.hasOwnProperty(admin)) {
        const operationIds = Object.keys(authorization_matrix?.matrix[admin]);
        for (const OperationId of operationIds) {
            authorization_matrix.matrix[admin][OperationId] = true;
        }
    }
    // stor matrix in database
    await authorization_matrix.storeMatrix()
}

const init_setting = async () => {
    return await db.$transaction(async (t) => {
        let size = (await t.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0;
        if (size > 10) return;
        for (let i = 1; i <= 10; i++) {
            try {
                await setting_set(t, generateRandomString(10, 10), generateRandomString(10, 10))
            } catch (err) { }
        }
    })
}

const init_operations = async (listOperationName: string[]) => {
    return await db.$transaction(async (t) => {
        for (let i = 0; i < listOperationName.length; i++)
            try {
                await operation_create(t, listOperationName[i])
            } catch (err) { }
    })
}

const init_roles = async (roles: string[]) => {
    return await db.$transaction(async (t) => {
        for (let i = 0; i < roles.length; i++) {
            try {
                await role_create(t, roles[i])
            } catch (err) { }
        }
    })
}

const init_users = async (roles: string[]) => {
    return await db.$transaction(async (t) => {
        for (let i = 0; i < roles.length; i++) {
            try {
                await user_create(t, {
                    id: roles[i],
                    password: roles[i],
                    roleId: roles[i],
                    photo: generateRandomString(100, 100)
                })
            } catch (err) { }
        }
    })
}

const init_todo = async () => {
    return await db.$transaction(async (t) => {
        let size = (await t.todos.aggregate({ _count: { id: true } }))._count.id ?? 0;
        if (size > 10) return;
        for (let i = 0; i < 10; i++) {
            const money_total = generateRandomInt(0, 100);
            const money_expenses = generateRandomInt(0, money_total);
            const money_paid = generateRandomInt(0, money_total);
            try {
                const r = await todo_create(t, {
                    employeeId: Math.random() > 0.5 ? 'admin' : 'employee',
                    dealerId: Math.random() > 0.5 ? 'admin' : 'employee',
                    description: generateRandomString(50, 100),
                    money_total: money_total,
                    money_expenses: money_expenses,
                    money_paid: money_paid,
                    photo: generateRandomString(100, 100)
                })
            } catch (err) { }
        }
    })
}

const init_product = async () => {
    return await db.$transaction(async (t) => {
        let size = (await t.products.aggregate({ _count: { id: true } }))._count.id ?? 0;
        if (size > 10) return;
        for (let i = 1; i <= 10; i++) {
            const p = `product_${i}`
            const u = `unity_${i}`
            const c = `categorie_${i}`
            const money_purchase = generateRandomInt(0, 100);
            const money_selling = generateRandomInt(money_purchase, 1000);
            const money_selling_gr = generateRandomInt(money_purchase, money_selling);
            // 
            try {
                await product_unity_create(t, u)
            } catch (err) { }
            try {
                await product_categorie_create(t, c)
            } catch (err) { }
            try {
                await product_create(t, {
                    id: p, unityId: u,
                    categorieId: c,
                    code: p,
                    description: p,
                    money_purchase: money_purchase,
                    money_selling: money_selling,
                    money_selling_gr: money_selling_gr,
                    quantity_alert: generateRandomInt(0, 10),
                    photo: generateRandomString(100, 100)
                })
            } catch (err) { }
        }
    })
}

const init_invoice = async () => {
    return await db.$transaction(async (t) => {
        let size = (await t.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0;
        if (size > 10) return;
        for (let i = 1; i <= 10; i++) {
            const invoiceId = await invoice_create(t, INVOICE_TYPES.PURCHASE, "admin")
            // add products to this invoice
            for (let j = 1; j <= 10; j++) {
                try {
                    await invoice_update_prudect(t, {
                        invoiceId: invoiceId,
                        prudectId: `product_${j}`,
                        quantity: generateRandomInt(1, 10),
                        description: generateRandomString(50, 100),
                    })
                } catch (err) { }
            }
            // calculate this invoice
            try {
                await invoice_update(t, invoiceId, {
                    dealerId: Math.random() > 0.5 ? 'admin' : 'employee',
                    description: generateRandomString(50, 100),
                    money_stamp: generateRandomInt(0, 100),
                    money_tax: generateRandomInt(0, 100)
                })
            } catch (err) { }
            // change value of paid
            try {
                const iii = await t.invoices.findUnique({ where: { id: invoiceId } })
                await invoice_update(t, invoiceId, { money_paid: iii.money_calc })
            } catch (err) { }
        }
    })
}