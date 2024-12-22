import { extendType, floatArg, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { ArgsProductQ, product_categories_get, product_photo_get, product_units_get, products_get } from './controller';
import { db } from '../../utils';
// **************************************************************************************************** 
export const ProductQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('products_get', {
            args: {
                id: nullable(stringArg()),
                categorieId: nullable(stringArg()),
                unityId: nullable(stringArg()),
                code: nullable(stringArg()),
                // 
                filter_id: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_update_gte: nullable(stringArg()),
                filter_update_lte: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                filter_quntity_gte: nullable(floatArg()),
                filter_quntity_lte: nullable(floatArg()),
                filter_date_alert_gte: nullable(stringArg()),
                filter_date_alert_lte: nullable(stringArg()),
                // 
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
            },
            description: "date format : 2000-01-01T00:00:00Z",
            type: products_get_out,
            resolve: async (parent, args: ArgsProductQ, context, info) => {
                return db.$transaction((t) => {
                    return products_get(t, args)
                })
            },
        });
        t.field('product_get_photo', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            async resolve(parent, args: { id?: string }, context, info): Promise<string> {
                return db.$transaction((t) => {
                    return product_photo_get(t, args.id)
                })
            },
        });
        t.field('product_units_get', {
            args: {},
            type: list('String'),
            async resolve(parent, args, context, info): Promise<string[]> {
                return db.$transaction((t) => {
                    return product_units_get(t)
                })
            },
        });
        t.field('product_categories_get', {
            args: {},
            type: list('String'),
            async resolve(parent, args, context, info): Promise<string[]> {
                return db.$transaction((t) => {
                    return product_categories_get(t)
                })
            },
        });
    }
});

export const product_get_out = objectType({
    name: 'product_get_out',
    definition(t) {
        ["id", "categorieId", "unityId", "code", "description"].map((x) => t.nullable.string(x));
        ["money_purchase", "money_selling", "money_selling_gr", "quantity", "quantity_alert", "date_alert", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
    },
});

export const products_get_out = objectType({
    name: 'products_get_out',
    definition(t) {
        t.nullable.int('allItemsCount')
        t.nullable.int('allPagesCount')
        t.nullable.int('pageNumber')
        t.nullable.int('itemsTake')
        t.nullable.int('itemsSkip')
        t.nullable.int('itemsCount')
        t.nullable.list.field('items', { type: 'product_get_out' })
    },
});