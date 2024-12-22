import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
class Models {
    private static instance = new PrismaClient()
    public static getInstance = () => Models.instance;
    constructor() { }
}
export const db = Models.getInstance();

export type db_Type = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
export type TransactionType = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">