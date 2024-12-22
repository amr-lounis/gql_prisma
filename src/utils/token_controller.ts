import jwt from "jsonwebtoken";
import { myConfig } from "../config";

export type jwtType = {
    id: string,
    role: string
}
class token_controller {
    constructor() { }

    Token_Create(id, role) {
        const payload: jwtType = { id: id, role: role };
        const token = jwt.sign(payload, myConfig.JWT_Secret, { expiresIn: myConfig.JWT_ExpiresDay });
        return token;
    }

    Token_Verifay(_token) {
        try {
            const tv = jwt.verify(_token, myConfig.JWT_Secret);
            return tv;
        } catch (error) {
            return { id: null, role: null }
        }
    }
}

export const MyToken = new token_controller();