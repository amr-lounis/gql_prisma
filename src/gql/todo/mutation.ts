import { booleanArg, extendType, floatArg, nonNull, nullable, stringArg } from 'nexus';
import { db, ContextType } from '../../utils';
import { ArgsTodoM, todo_create, todo_delete, todo_update, todo_update_validation } from './controller';
// **************************************************************************************************** 
export const TodoMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('todo_create', {
            args: {
                dealerId: nullable(stringArg()),
                description: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_total: nullable(floatArg()),
                money_paid: nullable(floatArg()),
                photo: nullable(stringArg()),
            },
            description: "return ID of new todo",
            type: nonNull('String'), // -------------------------------------------------- return ID of new todo
            resolve: async (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<string> => {
                return await db.$transaction(async (t) => {
                    args.employeeId = context.jwt.id
                    return await todo_create(t, args)
                })
            }
        });
        // --------------------------------------------------
        t.field('todo_update', {
            args: {
                id: nonNull(stringArg()),
                dealerId: nullable(stringArg()),
                description: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_total: nullable(floatArg()),
                money_paid: nullable(floatArg()),
                photo: nullable(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<boolean> => {
                return await db.$transaction(async (t) => {
                    // verification
                    const r = await t.todos.findUnique({ where: { id: args.id } })
                    if (r.employeeId != context.jwt.id) throw new Error('not authorized : update only by owner');
                    //  
                    return await todo_update(t, args.id, args)
                })

            },
        });
        // --------------------------------------------------
        t.field('todo_delete', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: { id: string }, context: ContextType, info: any): Promise<boolean> => {
                return await db.$transaction(async (t) => {
                    // verification
                    const r = await t.todos.findUnique({ where: { id: args.id } })
                    if (r.employeeId != context.jwt.id) throw new Error('not authorized : update only by owner');
                    // 
                    return todo_delete(t, args.id)
                })
            },
        });
        // --------------------------------------------------
        t.field('todo_set_valid', {
            args: {
                id: nonNull(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<string> => {
                return db.$transaction(async (t) => {
                    return todo_update_validation(t, args.id, true)
                })

            },
        });
        // --------------------------------------------------
        t.field('todo_set_invalid', {
            args: {
                id: nonNull(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<string> => {
                return db.$transaction(async (t) => {
                    return todo_update_validation(t, args.id, false)
                })

            },
        });
    }
});