import { booleanArg, extendType, floatArg, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { ArgsTodoQ, todo_photo_get, todos_get } from './controller';
import { db } from '../../utils';
// **************************************************************************************************** 
export const TodoQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('todos_get', {
            args: {
                id: nullable(stringArg()),
                employeeId: nullable(stringArg()),
                dealerId: nullable(stringArg()),
                validation: nullable(booleanArg()),
                filter_description: nullable(stringArg()),
                filter_update_gte: nullable(stringArg()),
                filter_update_lte: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
                money_unpaid_gte: nullable(floatArg()),
                money_unpaid_lte: nullable(floatArg()),
            },
            description: "date format : 2000-01-01T00:00:00Z",
            type: todos_out,
            resolve: async (parent, args: ArgsTodoQ, context, info) => {
                return await db.$transaction(async (t) => {
                    return await todos_get(t, args)
                })
            },
        });
        // --------------------------------------------------
        t.field('todo_photo_get', {
            args: { todoId: nonNull(stringArg()) },
            type: nonNull("String"),
            resolve: async (parent, args: ArgsTodoQ, context, info): Promise<string> => {
                return await db.$transaction(async (t) => {
                    return await todo_photo_get(t, args)
                })
            },
        });
    }
});
export const todo_get_out = objectType({
    name: 'todo_get_out',
    definition(t) {
        ["id", "employeeId", "dealerId", "validation", "description"].map((x) => t.nullable.string(x));
        ["money_expenses", "money_total", "money_paid", "money_unpaid", "money_margin", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
        ["validation"].map((x) => t.nullable.boolean(x));
    },
});
export const todos_out = objectType({
    name: 'todos_get_out',
    definition(t) {
        t.nullable.int('allItemsCount')
        t.nullable.int('allPagesCount')
        t.nullable.int('pageNumber')
        t.nullable.int('itemsTake')
        t.nullable.int('itemsSkip')
        t.nullable.int('itemsCount')
        t.nullable.list.field('items', { type: 'todo_get_out' })
    },
});
