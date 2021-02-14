/* eslint-disable @typescript-eslint/indent */
import { IAccountModel } from "../../../domain/models/account";
import { ILoadAccountByEmailRepository } from "../../protocols/load-account-by-email-repository";
import { DbAuthentication } from "./db-authentication";

describe("DbAuthentication UseCase", () => {
    test("Should call LoadAccountByEmailRepository with correct email", async () => {
        class LoadAccountByEmailRepositoryStub
            implements ILoadAccountByEmailRepository {
            async load(email: string): Promise<IAccountModel> {
                const account: IAccountModel = {
                    id: "any_id",
                    name: "any_name",
                    email: "any_email@mail.com",
                    password: "any_password",
                };

                return await new Promise(resolve => resolve(account));
            }
        }

        const loadAccountByEmailRepositoryStub = new LoadAccountByEmailRepositoryStub();
        const sut = new DbAuthentication(loadAccountByEmailRepositoryStub);
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, "load");

        await sut.auth({
            email: "any_email@mail.com",
            password: "any_password",
        });

        expect(loadSpy).toHaveBeenCalledWith("any_email@mail.com");
    });
});
