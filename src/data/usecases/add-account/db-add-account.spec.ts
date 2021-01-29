import { DbAddAccount } from "./db-add-account";
import {
    IEncrypter,
    IAddAccountModel,
    IAccountModel,
    IAddAccountRepository,
} from "./db-add-account-protocols";

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(value: string): Promise<string> {
            return await new Promise(resolve => resolve("hashed_password"));
        }
    }

    return new EncrypterStub();
};

const makeAddAccountRepository = (): IAddAccountRepository => {
    class AddAccountRepositoryStub implements IAddAccountRepository {
        async add(accountData: IAddAccountModel): Promise<IAccountModel> {
            return await new Promise(resolve => resolve(makeFakeAccount()));
        }
    }

    return new AddAccountRepositoryStub();
};

const makeFakeAccount = (): IAccountModel => ({
    id: "valid_id",
    name: "valid_name",
    email: "valid_email",
    password: "hashed_password",
});

const makeFakeAccountData = (): IAddAccountModel => ({
    name: "valid_name",
    email: "valid_email",
    password: "valid_password",
});

interface ISutTypes {
    sut: DbAddAccount;
    encrypterStub: IEncrypter;
    addAccountRepositoryStub: IAddAccountRepository;
}

const makeSut = (): ISutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);

    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub,
    };
};

describe("DbAddAccount Usecase", () => {
    test("Should call Encrypter with correct password", async () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, "encrypt");

        await sut.add(makeFakeAccountData());
        expect(encryptSpy).toHaveBeenLastCalledWith("valid_password");
    });

    test("Should throw if Encrypter throws", async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, "encrypt").mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.add(makeFakeAccountData());
        await expect(promise).rejects.toThrow();
    });

    test("Should call AddAccountRepository with correct values", async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const addAccountRepositorySpy = jest.spyOn(
            addAccountRepositoryStub,
            "add",
        );

        await sut.add(makeFakeAccountData());
        expect(addAccountRepositorySpy).toHaveBeenLastCalledWith({
            name: "valid_name",
            email: "valid_email",
            password: "hashed_password",
        });
    });

    test("Should throw if AddAccountRepository throws", async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        jest.spyOn(addAccountRepositoryStub, "add").mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.add(makeFakeAccountData());
        await expect(promise).rejects.toThrow();
    });

    test("Should return an account on success", async () => {
        const { sut } = makeSut();

        const account = await sut.add(makeFakeAccountData());
        expect(account).toEqual(makeFakeAccount());
    });
});
