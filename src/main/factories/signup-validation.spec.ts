import { RequiredFieldValidation } from "../../presentation/helpers/validators/required-field-validation";
import { IValidation } from "../../presentation/helpers/validators/validation";
import { ValidationComposite } from "../../presentation/helpers/validators/validation-composite";
import { makeSignUpValidation } from "./signup-validation";

// When someone calls ValidationComposite, it will be mocked
// it means, it doesn't have the standard behavinour anymore.
jest.mock("../../presentation/helpers/validators/validation-composite");

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

        expect(ValidationComposite).toHaveBeenCalledWith(validations);
    });
});
