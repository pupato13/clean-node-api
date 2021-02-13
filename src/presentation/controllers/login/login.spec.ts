import { LoginController } from "./login";
import { badRequest } from "../../helpers/http-helper";
import { MissingParamError } from "../../errors";
import { IEmailValidator } from "../../protocols/email-validator";

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

interface ISutTypes {
    sut: LoginController;
    emailValidatorStub: IEmailValidator;
}

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new LoginController(emailValidatorStub);

    return { sut, emailValidatorStub };
};

describe("Login COntroller", () => {
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

    test("Should call EmailValidator with correct email", async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

        const httpRequest = {
            body: {
                email: "any_email@mail.com",
                password: "any_password",
            },
        };

        await sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith("any_email@mail.com");
    });
});
