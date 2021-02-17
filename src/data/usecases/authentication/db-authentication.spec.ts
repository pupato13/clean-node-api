/* eslint-disable @typescript-eslint/indent */
import { IAccountModel } from "../../../domain/models/account";
import { IAuthenticationModel } from "../../../domain/usecases/authentication";
import { ILoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";
import { DbAuthentication } from "./db-authentication";

const makeFakeAccount = (): IAccountModel => ({
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "any_password",
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

const makeFakeAuthentication = (): IAuthenticationModel => ({
    email: "any_email@mail.com",
    password: "any_password",
});

interface ISutTypes {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository;
}

const makeSut = (): ISutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub);

    return { sut, loadAccountByEmailRepositoryStub };
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
});