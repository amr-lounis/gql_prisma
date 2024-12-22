import https from "https";
import http from "http";
import fs from "fs"
import { authorization_matrix } from "./authorization_matrix"
import { myLog } from "./myFunc";
// -------------------------------------------------- https_server
export const https_server = (_app_express: any, _path_cert: string, _path_key: string) => {
    myLog(" +++++ https_server +++++ ")
    const serverOptions = {
        cert: fs.readFileSync(_path_cert),
        key: fs.readFileSync(_path_key)
    }
    return https.createServer(serverOptions, _app_express);
}
// -------------------------------------------------- http_server
export const http_server = (_app_express: any) => {
    myLog(" +++++ http_server +++++ ")
    return http.createServer(_app_express);
}
//-------------- Middlewares
export const myMiddleware = async (resolve: any, root: any, args: any, context: ContextType, info: any) => {
    if ((info?.parentType?.name == 'Query') || (info?.parentType?.name == 'Mutation')) {
        context.operation = info?.fieldName || ''
        context.fields = info.fieldNodes[0].selectionSet?.selections?.map((field) => field.name.value);
        const r = authorization_matrix.authorization_test(context.jwt.role, context.operation)
        if (!r) throw Error(`role:${context.jwt.role} --- operation:${context.operation} not authorized .`)
        if (args?.id?.length < 1) return new Error("id length smal then 1 ")
        myLog(`args:[${Object.keys(args)}] --- context:${JSON.stringify(context)}`)
    }
    return await resolve(root, args, context, info)
}

export type ContextType = {
    operation?: string,
    fields?: string[],
    jwt?: {
        id: string,
        role: string,
        iat: number,
        exp: number
    }
}