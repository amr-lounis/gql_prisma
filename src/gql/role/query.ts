import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db } from '../../utils';
import { authorizations_get, operations_get, roles_get } from './controller';
// **************************************************************************************************** 
export const RoleQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('operations_get', {
            args: {},
            type: list('String'),
            resolve: (parent, args: void, context, info): Promise<string[]> => {
                return db.$transaction((t) => {
                    return operations_get(t)
                })
            },
        });
        // --------------------------------------------------
        t.field('roles_get', {
            args: {},
            type: list('String'),
            resolve: (parent, args: void, context, info): Promise<string[]> => {
                return db.$transaction((t) => {
                    return roles_get(t)
                })
            },
        });
        // --------------------------------------------------
        t.field('role_authorizations_get', {
            args: { roleId: nonNull(stringArg()) },
            type: list(objectType({
                name: 'authorizations_get_out',
                definition(t) {
                    t.nullable.string("operationId")
                    t.nullable.boolean("value")
                },
            })),
            resolve: (parent, args: { roleId?: string }, context, info) => {
                return db.$transaction((t) => {
                    return authorizations_get(t, args.roleId)
                })
            }
        });
    }
});
