import {
    ValidationComposite,
    CompareFieldsValidation,
    EmailValidation,
    RequiredFieldValidation,
} from "../../../presentation/helpers/validators";
import { IValidation } from "../../../presentation/protocols/validation";
import { IEmailValidator } from "../../../presentation/protocols/email-validator";
import { makeSignUpValidation } from "./signup-validation-factory";

// When someone calls ValidationComposite, it will be mocked
// it means, it doesn't have the standard behavinour anymore.
jest.mock("../../../presentation/helpers/validators/validation-composite");

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

describe("SignUpValidation Factory", () => {
    test("Should call ValidationComposite with all validations", () => {
        makeSignUpValidation();

        const validations: IValidation[] = [];

        for (const field of [
            "name",
            "email",
            "password",
            "passwordConfirmation",
        ]) {
            validations.push(new RequiredFieldValidation(field));
        }

        validations.push(
            new CompareFieldsValidation("password", "passwordConfirmation"),
        );

        validations.push(new EmailValidation("email", makeEmailValidator()));

        expect(ValidationComposite).toHaveBeenCalledWith(validations);
    });
});
