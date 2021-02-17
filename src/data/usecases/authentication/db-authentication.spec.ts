/* eslint-disable @typescript-eslint/indent */
import { IAccountModel } from "../../../domain/models/account";
import { IAuthenticationModel } from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/criptography/hash-comparer";
import { ILoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";
import { DbAuthentication } from "./db-authentication";

const makeFakeAccount = (): IAccountModel => ({
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "hashed_password",
});

const makeLoadAccountByEmailRepository = (): ILoadAccountByEmailRepository => {
    class LoadAccountByEmailRepositoryStub
        implements ILoadAccountByEmailRepository {
        async load(email: string): Promise<IAccountModel> {
            return await new Promise(resolve => resolve(makeFakeAccount()));
        }
    }

    return new LoadAccountByEmailRepositoryStub();
};

const makeHashComparer = (): IHashComparer => {
    class HashComparerStub implements IHashComparer {
        async compare(value: string, hash: string): Promise<boolean> {
            return await new Promise(resolve => resolve(true));
        }
    }

    return new HashComparerStub();
};

const makeFakeAuthentication = (): IAuthenticationModel => ({
    email: "any_email@mail.com",
    password: "any_password",
});

interface ISutTypes {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository;
    hashComparerStub: IHashComparer;
}

const makeSut = (): ISutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const hashComparerStub = makeHashComparer();
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
    );

    return { sut, loadAccountByEmailRepositoryStub, hashComparerStub };
};

describe("DbAuthentication UseCase", () => {
    test("Should call LoadAccountByEmailRepository with correct email", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, "load");

        await sut.auth(makeFakeAuthentication());

        expect(loadSpy).toHaveBeenCalledWith("any_email@mail.com");
    });

    test("Should throw if LoadAccountByEmailRepository throws", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            "load",
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.auth(makeFakeAuthentication());

        await expect(promise).rejects.toThrow();
    });

    test("Should return null if LoadAccountByEmailRepository returns null", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(loadAccountByEmailRepositoryStub, "load").mockReturnValue(
            null,
        );

        const accessToken = await sut.auth(makeFakeAuthentication());

        expect(accessToken).toBe(null);
    });

    test("Should call HashCompare with correct values", async () => {
        const { sut, hashComparerStub } = makeSut();
        const compareSpy = jest.spyOn(hashComparerStub, "compare");

        await sut.auth(makeFakeAuthentication());

        expect(compareSpy).toHaveBeenCalledWith(
            "any_password",
            "hashed_password",
        );
    });

    test("Should throw if HashComparer throws", async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, "compare").mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.auth(makeFakeAuthentication());

        await expect(promise).rejects.toThrow();
    });

    test("Should return null if HashComparer returns false", async () => {
        const { sut, hashComparerStub } = makeSut();
        jest.spyOn(hashComparerStub, "compare").mockReturnValue(
            new Promise(resolve => resolve(false)),
        );

        const accessToken = await sut.auth(makeFakeAuthentication());

        expect(accessToken).toBe(null);
    });
});
