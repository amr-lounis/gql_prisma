export * from './controller'
import { TransactionType, generateID, toPage } from '../../utils';

// **************************************************************************************************** 
export const todos_get = async (tr: TransactionType, args: ArgsTodoQ) => {
    const itemsCountAll = (await tr.todos.aggregate({
        _count: { id: true }, where: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            validation: args.validation,
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            money_unpaid: { gte: args.money_unpaid_gte, lte: args.money_unpaid_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await tr.todos.findMany({
        orderBy: { createdAt: 'desc' }, where: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            validation: args.validation,
            updatedAt: { gte: args.filter_update_gte, lte: args.filter_update_lte },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            money_unpaid: { gte: args.money_unpaid_gte, lte: args.money_unpaid_lte },
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
export const todo_photo_get = async (tr: TransactionType, args: ArgsTodoQ): Promise<string> => {
    // verification
    const p = await tr.t_photos.findUnique({ where: { todoId: args.todoId } },);
    if (!p) throw new Error('todo id is not exist');
    // 
    return p?.photo?.toString() ?? ""
}
export const todo_create = async (tr: TransactionType, args: ArgsTodoM): Promise<string> => {
    // verification
    if (args.employeeId == undefined) throw new Error('employee id is required');
    const todo = await tr.todos.create({ data: { id: generateID(args.employeeId + ".invalid") } });
    await tr.t_photos.create({ data: { todoId: todo.id, photo: Buffer.from("", 'utf8') } });
    delete args?.id
    await todo_update(tr, todo.id, args)
    return todo.id
}
export const todo_update = async (tr: TransactionType, todoId: string, args: ArgsTodoM) => {
    const todo = await todoGetOrError(tr, todoId);
    if (todo.validation == true) throw new Error('todo is validated.');
    const money_expenses = (args.money_expenses ?? todo.money_expenses);
    const money_total = (args.money_total ?? todo.money_total);
    const money_paid = (args.money_paid ?? money_total);
    // 
    if (args.money_expenses < 0) throw new Error("error : money_expenses < 0")
    if (args.money_total < 0) throw new Error("error : money_total < 0")
    if (args.money_paid < 0) throw new Error("error : money_paid  < 0")
    if (args.money_paid > args.money_total) throw new Error("error : money_paid  > money_total")
    const r = await tr.todos.update({
        where: {
            id: todoId
        },
        data: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            description: args.description,
            money_expenses: money_expenses,
            money_total: money_total,
            money_paid: money_paid,
            money_unpaid: money_total - money_paid,
            money_margin: money_total - money_expenses
        }
    });
    if (args.photo != undefined) {
        if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
        await tr.t_photos.update({ where: { todoId: todoId }, data: { photo: photpBytes } });
    }
    return true
}
export const todo_delete = async (tr: TransactionType, todoId: string) => {
    const todo = await todoGetOrError(tr, todoId);
    if (todo.validation == true) throw new Error('todo is validated.');
    await tr.todos.delete({ where: { id: todoId } })
    return true
}
export const todo_update_validation = async (tr: TransactionType, todoId: string, validationNew: boolean): Promise<string> => {
    const todo = await todoGetOrError(tr, todoId);
    if (validationNew == true && todo.validation == true) throw new Error('invoice already validated.');
    if (validationNew == false && todo.validation == false) throw new Error('invoice already invalidate.');
    if (validationNew == true && todo.validation == false) {// to valid
        await tr.todos.update({ where: { id: todoId }, data: { validation: true, id: generateID(todo.employeeId + ".valid") } })
    }
    if (validationNew == false && todo.validation == true) { // to invalid
        await tr.todos.update({ where: { id: todoId }, data: { validation: false, id: generateID(todo.employeeId + ".invalid") } })
    }
    return ""
}
export const todoGetOrError = async (tr: TransactionType, todoId: string) => {
    if (todoId == undefined) throw new Error('todo id is required');
    const todo = await tr.todos.findUnique({ where: { id: todoId } })
    if (!todo) throw new Error(`todo id ${todoId} not exist .`);
    return todo
}
// **************************************************************************************************** 
export type ArgsTodoQ = {
    id?: string,
    todoId?: string,
    employeeId?: string,
    dealerId?: string,
    validation?: boolean,
    filter_description?: string,
    filter_update_gte?: string,
    filter_update_lte?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
    money_unpaid_gte?: number,
    money_unpaid_lte?: number,
}
export type ArgsTodoM = {
    id?: string,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    money_expenses?: number,
    money_total?: number,
    money_paid?: number,
    photo?: string,
}
// **************************************************************************************************** 