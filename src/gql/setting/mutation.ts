import { extendType, nonNull, stringArg } from 'nexus';
import { setting_set } from './controller';
import { db } from '../../utils';
// **************************************************************************************************** 
export const SettingMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('setting_set', {
            args: { key: nonNull(stringArg()), value: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { key?: string, value?: string }, context, info): Promise<boolean> => {
                return db.$transaction(async (t) => {
                    return setting_set(t, args.key, args.value)
                })
            },
        });
    }
});
