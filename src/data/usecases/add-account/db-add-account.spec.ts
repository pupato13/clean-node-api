import { DbAddAccount } from "./db-add-account";
import { IEncrypter } from "./db-add-account-protocols";

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(value: string): Promise<string> {
            return await new Promise(resolve => resolve("hashed_password"));
        }
    }

    return new EncrypterStub();
};

interface ISutTypes {
    sut: DbAddAccount;
    encrypterStub: IEncrypter;
}

const makeSut = (): ISutTypes => {
    const encrypterStub = makeEncrypter();
    const sut = new DbAddAccount(encrypterStub);

    return {
        sut,
        encrypterStub,
    };
};

describe("DbAddAccount Usecase", () => {
    test("Should call Encrypter with correct password", async () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, "encrypt");
        const accountData = {
            name: "valid_name",
            email: "valid_email",
            password: "valid_password",
        };

        await sut.add(accountData);
        expect(encryptSpy).toHaveBeenLastCalledWith("valid_password");
    });

    test("Should throw if Encrypter throws", async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, "encrypt").mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );
        const accountData = {
            name: "valid_name",
            email: "valid_email",
            password: "valid_password",
        };

        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });
});
