import { InvalidParamError } from "../../errors";
import { CompareFieldsValidation } from "./compare-fields-validation";

const makeSut = (): CompareFieldsValidation => {
    return new CompareFieldsValidation("any_field", "any_FieldToCompare");
};

describe("CompareFields Validation", () => {
    test("Should return a InvalidParamError if validation fails", () => {
        const sut = makeSut();
        const error = sut.validate({
            any_field: "any_value",
            any_FieldToCompare: "wrong_value",
        });
        expect(error).toEqual(new InvalidParamError("any_FieldToCompare"));
    });

    test("Should not return if validation succeeds", () => {
        const sut = makeSut();
        const error = sut.validate({
            any_field: "any_value",
            any_FieldToCompare: "any_value",
        });
        expect(error).toBeFalsy();
    });
});
