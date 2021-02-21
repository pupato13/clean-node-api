/* eslint-disable @typescript-eslint/indent */
import { DbAuthentication } from "./db-authentication";
import {
    IAccountModel,
    IAuthenticationModel,
    IHashComparer,
    IEncrypter,
    ILoadAccountByEmailRepository,
    IUpdateAccessTokenRepository,
} from "./db-authentication-protocols";

const makeFakeAccount = (): IAccountModel => ({
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "hashed_password",
});

const makeLoadAccountByEmailRepository = (): ILoadAccountByEmailRepository => {
    class LoadAccountByEmailRepositoryStub
        implements ILoadAccountByEmailRepository {
        async loadByEmail(email: string): Promise<IAccountModel> {
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

const makeEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(value: string): Promise<string> {
            return await new Promise(resolve => resolve("any_token"));
        }
    }

    return new EncrypterStub();
};

const makeUpdateAccessTokenRepository = (): IUpdateAccessTokenRepository => {
    class UpdateAccessTokenRepositoryStub
        implements IUpdateAccessTokenRepository {
        async updateAccessToken(id: string, token: string): Promise<void> {
            return await new Promise(resolve => resolve());
        }
    }

    return new UpdateAccessTokenRepositoryStub();
};

const makeFakeAuthentication = (): IAuthenticationModel => ({
    email: "any_email@mail.com",
    password: "any_password",
});

interface ISutTypes {
    sut: DbAuthentication;
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository;
    hashComparerStub: IHashComparer;
    encrypterStub: IEncrypter;
    updateAccessTokenRepositoryStub: IUpdateAccessTokenRepository;
}

const makeSut = (): ISutTypes => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
    const hashComparerStub = makeHashComparer();
    const encrypterStub = makeEncrypter();
    const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository();

    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub,
    );

    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub,
    };
};

describe("DbAuthentication UseCase", () => {
    test("Should call LoadAccountByEmailRepository with correct email", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        const loadSpy = jest.spyOn(
            loadAccountByEmailRepositoryStub,
            "loadByEmail",
        );

        await sut.auth(makeFakeAuthentication());

        expect(loadSpy).toHaveBeenCalledWith("any_email@mail.com");
    });

    test("Should throw if LoadAccountByEmailRepository throws", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            "loadByEmail",
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.auth(makeFakeAuthentication());

        await expect(promise).rejects.toThrow();
    });

    test("Should return null if LoadAccountByEmailRepository returns null", async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut();
        jest.spyOn(
            loadAccountByEmailRepositoryStub,
            "loadByEmail",
        ).mockReturnValue(null);

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

    test("Should call Encrypter with correct id", async () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, "encrypt");

        await sut.auth(makeFakeAuthentication());

        expect(encryptSpy).toHaveBeenCalledWith("any_id");
    });

    test("Should throw if Encrypter throws", async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, "encrypt").mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.auth(makeFakeAuthentication());

        await expect(promise).rejects.toThrow();
    });

    test("Should return a token on success", async () => {
        const { sut } = makeSut();

        const accessToken = await sut.auth(makeFakeAuthentication());

        expect(accessToken).toBe("any_token");
    });

    test("Should call UpdateAccessTokenRepository with correct values", async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        const updateSpy = jest.spyOn(
            updateAccessTokenRepositoryStub,
            "updateAccessToken",
        );

        await sut.auth(makeFakeAuthentication());

        expect(updateSpy).toHaveBeenCalledWith("any_id", "any_token");
    });

    test("Should throw if UpdateAccessTokenRepository throws", async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut();
        jest.spyOn(
            updateAccessTokenRepositoryStub,
            "updateAccessToken",
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const promise = sut.auth(makeFakeAuthentication());

        await expect(promise).rejects.toThrow();
    });
});
