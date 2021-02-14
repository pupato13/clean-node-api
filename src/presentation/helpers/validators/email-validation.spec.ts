import { EmailValidation } from "./email-validation";
import { IEmailValidator } from "../../protocols/email-validator";
import { InvalidParamError } from "../../errors";

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

interface ISutTypes {
    sut: EmailValidation;
    emailValidatorStub: IEmailValidator;
}

const makeSut = (): ISutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new EmailValidation("email", emailValidatorStub);

    return {
        sut,
        emailValidatorStub,
    };
};

describe("Email Validation", () => {
    test("Should return 400 an error if EmailValidator returns false", () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);

        const error = sut.validate({
            email: "valid_email@mail.com",
        });

        expect(error).toEqual(new InvalidParamError("email"));
    });

    test("Should call EmailValidator with correct email", () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

        sut.validate({ email: "any_email@mail.com" });
        expect(isValidSpy).toHaveBeenCalledWith("any_email@mail.com");
    });

    test("Should throw if IEmailValidator throws", () => {
        const { sut, emailValidatorStub } = makeSut();

        jest.spyOn(emailValidatorStub, "isValid").mockImplementationOnce(() => {
            throw new Error();
        });

        expect(sut.validate).toThrow();
    });
});
