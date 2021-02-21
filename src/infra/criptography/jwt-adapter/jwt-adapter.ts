import jwt from "jsonwebtoken";
import { IEncrypter } from "../../../data/protocols/criptography/encrypter";

export class JwtAdapter implements IEncrypter {
    private readonly secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    async encrypt(value: string): Promise<string> {
        await jwt.sign({ id: value }, this.secret);

        return null;
    }
}
