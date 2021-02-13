import { LoginController } from "./login";
import { badRequest, serverError } from "../../helpers/http-helper";
import { InvalidParamError, MissingParamError } from "../../errors";
import { IEmailValidator } from "../../protocols/email-validator";
import { IHttpRequest } from "../../protocols";
import { IAuthentication } from "../../../domain/usecases/authentication";

const makeAuthentication = (): IAuthentication => {
    class AuthenticationStub implements IAuthentication {
        async auth(email: string, password: string): Promise<string> {
            return await new Promise(resolve => resolve("any_token"));
        }
    }

    return new AuthenticationStub();
};

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

const makeFakeRequest = (): IHttpRequest => ({
    body: {
        email: "any_email@mail.com",
        password: "any_password",
    },
});

interface ISutTypes {
    sut: LoginController;
    emailValidatorStub: IEmailValidator;
    authenticationStub: IAuthentication;
}

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const authenticationStub = makeAuthentication();
    const sut = new LoginController(emailValidatorStub, authenticationStub);

    return { sut, emailValidatorStub, authenticationStub };
};

describe("Login Controller", () => {
    test("Should return 400 if no email is provided", async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: "any_password",
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(
            badRequest(new MissingParamError("email")),
        );
    });

    test("Should return 400 if no password is provided", async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: "any_email@mail.com",
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(
            badRequest(new MissingParamError("password")),
        );
    });

    test("Should return 400 if an invalid email is provided", async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);

        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(
            badRequest(new InvalidParamError("email")),
        );
    });

    test("Should call EmailValidator with correct email", async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

        await sut.handle(makeFakeRequest());
        expect(isValidSpy).toHaveBeenCalledWith("any_email@mail.com");
    });

    test("Should return 500 if EmailValidator throws", async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, "isValid").mockImplementationOnce(() => {
            throw new Error();
        });

        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new Error()));
    });

    test("Should call Authentication with correct values", async () => {
        const { sut, authenticationStub } = makeSut();
        const authSpy = jest.spyOn(authenticationStub, "auth");

        await sut.handle(makeFakeRequest());
        expect(authSpy).toHaveBeenCalledWith(
            "any_email@mail.com",
            "any_password",
        );
    });
});
