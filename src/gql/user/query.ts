import { extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, ContextType } from '../../utils';
import { ArgsUserQ, user_authentication, user_authentication_renewal, user_photo_get, user_role_get, users_get } from './controller';
// **************************************************************************************************** 
export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('user_authentication', {
            args: { id: nonNull(stringArg()), password: nonNull(stringArg()) },
            type: nonNull("String"),
            resolve: (parent, args: ArgsUserQ, context, info): Promise<string> => {
                return db.$transaction((t) => {
                    return user_authentication(t, args.id, args.password)
                })
            },
        });
        // --------------------------------------------------
        t.field('user_authentication_renewal', {
            args: {},
            type: nonNull("String"),
            resolve(parent, args: void, context: ContextType, info): string {
                return user_authentication_renewal(context?.jwt?.id, context?.jwt?.role)
            },
        });
        // -------------------------------------------------- 
        t.field('user_authentication_info', {
            args: {},
            type: nonNull("String"),
            resolve: (parent, args: ArgsUserQ, context: ContextType, info): string => {
                const id = context.jwt.id
                const role = context.jwt.role
                const iat = new Date(context.jwt.iat * 1000).toISOString()
                const exp = new Date(context.jwt.exp * 1000).toISOString()
                return `{id:${id},role:${role},iat:${iat},exp:${exp}}`
            },
        });
        // --------------------------------------------------
        t.field('user_role_get', {
            args: { id: nonNull(stringArg()), },
            type: nonNull("String"),
            resolve: (parent, args: ArgsUserQ, context, info): Promise<string> => {
                return db.$transaction((t) => {
                    return user_role_get(t, args.id)
                })
            },
        });
        // --------------------------------------------------
        t.field('user_photo_get', {
            args: { userId: nonNull(stringArg()), },
            type: nonNull("String"),
            resolve: (parent, args: ArgsUserQ, context, info): Promise<string> => {
                return db.$transaction((t) => {
                    return user_photo_get(t, args.userId)
                })
            },
        });
        // --------------------------------------------------
        t.field('users_get', {
            args: {
                id: nullable(stringArg()),
                filter_id: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_update_gte: nullable(stringArg()),
                filter_update_lte: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
            },
            type: users_out,
            description: "date format : 2000-01-01T00:00:00Z",
            resolve: (parent, args: ArgsUserQ, context, info) => {
                return db.$transaction((t) => {
                    return users_get(t, args)
                })
            },
        });
    }
});
// **************************************************************************************************** 
export const user_get_out = objectType({
    name: 'user_get_out',
    definition(t) {
        ["id", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
            t.nullable.string(x)
        );
        ["createdAt", "updatedAt"].map(x =>
            t.nullable.float(x)
        );
    },
});
export const users_out = objectType({
    name: 'users_out',
    definition(t) {
        t.nullable.int('allItemsCount');
        t.nullable.int('allPagesCount');
        t.nullable.int('pageNumber');
        t.nullable.int('itemsTake');
        t.nullable.int('itemsSkip');
        t.nullable.int('itemsCount');
        t.nullable.list.field('items', { type: 'user_get_out' });
    },
});
