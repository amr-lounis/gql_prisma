export const myConfig: myConfigType = {
    JWT_Secret: "jwtSecret aaaaabbbbbcccccdddddeeeeefffff",
    JWT_ExpiresDay: "7 days",
    PORT_HTTP: 80,
    PORT_HTTPS: 443,
    SERVER_SSL: false,
    path_ssl_crt: "./_utils/cert-gen/sub_file.crt",
    path_ssl_key: "./_utils/cert-gen/sub_file.key",
    myLog: true
}
// -------------------------------------------------- types
type myConfigType = {
    JWT_Secret: string,
    JWT_ExpiresDay: string,
    PORT_HTTP: number,
    PORT_HTTPS: number,
    SERVER_SSL: boolean,
    path_ssl_crt: string,
    path_ssl_key: string
    myLog: boolean
}