import { booleanArg, extendType, nonNull, stringArg } from 'nexus';
import { role_authorization_set, role_create, role_delete, role_update } from './controller';
import { db } from '../../utils';
// **************************************************************************************************** 
export const RoleMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('role_create', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return role_create(t, args.id)
                })
            },
        });
        // --------------------------------------------------
        t.field('role_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return role_update(t, args.id, args.idNew)
                })
            }
        });
        // --------------------------------------------------
        t.field('role_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return role_delete(t, args.id)
                })
            }
        });
        // --------------------------------------------------
        t.field('role_authorization_set', {
            args: { roleId: nonNull(stringArg()), operationId: nonNull(stringArg()), value: nonNull(booleanArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { roleId: string, operationId: string, value: boolean }, context, info): Promise<boolean> => {
                return db.$transaction((t) => {
                    return role_authorization_set(t, args.roleId, args.operationId, args.value)
                })
            }
        });
    }
});
