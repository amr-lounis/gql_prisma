import { extendType, nonNull, nullable, stringArg } from 'nexus';
import { db, ContextType } from '../../utils';
import { ArgsUserM, user_create, user_delete, user_update } from './controller';
// **************************************************************************************************** 
export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // --------------------------------------------------
        t.field('user_create', {
            args: {
                id: nonNull(stringArg()),
                password: stringArg(),
                description: stringArg(),
                address: stringArg(),
                first_name: stringArg(),
                last_name: stringArg(),
                phone: stringArg(),
                fax: stringArg(),
                email: stringArg(),
                photo: stringArg(),
            },
            type: nonNull("Boolean"),
            resolve: (parent, args: ArgsUserM, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return user_create(t, args)
                })
            }
        });
        // --------------------------------------------------
        t.field('user_update_self', {
            args: {
                password: stringArg(),
                description: stringArg(),
                address: stringArg(),
                first_name: stringArg(),
                last_name: stringArg(),
                phone: stringArg(),
                fax: stringArg(),
                email: stringArg(),
                photo: stringArg(),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsUserM, context: ContextType, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return user_update(t, context?.jwt?.id, args)
                })
            }
        });
        // --------------------------------------------------
        t.field('user_update_id', {
            args: {
                userId: nonNull(stringArg()),
                userIdNew: nonNull(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: { userId: string, userIdNew: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return user_update(t, args.userId, { id: args.userIdNew })
                })
            },
        });
        // --------------------------------------------------
        t.field('user_update_role', {
            args: {
                userId: nonNull(stringArg()),
                roleId: nullable(stringArg())
            },
            type: nullable("Boolean"),
            resolve: (parent, args: { userId: string, roleId: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return user_update(t, args.userId, { roleId: args.roleId })
                })
            }
        });
        // --------------------------------------------------
        t.field('user_delete', {
            args: { userId: nonNull(stringArg()) },
            type: nonNull("Boolean"),
            resolve: (parent, args: { userId: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return user_delete(t, args.userId)
                })
            },
        });
    },
});
// **************************************************************************************************** 
