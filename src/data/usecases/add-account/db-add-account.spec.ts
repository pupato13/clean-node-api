import { DbAddAccount } from "./db-add-account";
import {
    IHasher,
    IAddAccountModel,
    IAccountModel,
    IAddAccountRepository,
} from "./db-add-account-protocols";

const makeHasher = (): IHasher => {
    class HasherStub implements IHasher {
        async hash(value: string): Promise<string> {
            return await new Promise(resolve => resolve("hashed_password"));
        }
    }

    return new HasherStub();
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
    hasherStub: IHasher;
    addAccountRepositoryStub: IAddAccountRepository;
}

const makeSut = (): ISutTypes => {
    const hasherStub = makeHasher();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub);

    return {
        sut,
        hasherStub,
        addAccountRepositoryStub,
    };
};

describe("DbAddAccount Usecase", () => {
    test("Should call Hasher with correct password", async () => {
        const { sut, hasherStub } = makeSut();
        const hashSpy = jest.spyOn(hasherStub, "hash");

        await sut.add(makeFakeAccountData());
        expect(hashSpy).toHaveBeenLastCalledWith("valid_password");
    });

    test("Should throw if Hasher throws", async () => {
        const { sut, hasherStub } = makeSut();
        jest.spyOn(hasherStub, "hash").mockReturnValueOnce(
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
