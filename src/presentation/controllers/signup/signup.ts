import {
    IHttpRequest,
    IHttpResponse,
    IController,
    IEmailValidator,
    IAddAccount,
} from "./signup-protocols";
import { InvalidParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helper";
import { IValidation } from "../../helpers/validators/validation";

export class SignUpController implements IController {
    private readonly emailValidator: IEmailValidator;
    private readonly addAccount: IAddAccount;
    private readonly validation: IValidation;

    constructor(
        emailValidator: IEmailValidator,
        addAccount: IAddAccount,
        validation: IValidation,
    ) {
        this.emailValidator = emailValidator;
        this.addAccount = addAccount;
        this.validation = validation;
    }

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(httpRequest.body);

            if (error) {
                return badRequest(error);
            }

            const {
                name,
                email,
                password,
                passwordConfirmation,
            } = httpRequest.body;

            if (password !== passwordConfirmation) {
                return badRequest(
                    new InvalidParamError("passwordConfirmation"),
                );
            }

            const isValid = this.emailValidator.isValid(email);

            if (!isValid) {
                return badRequest(new InvalidParamError("email"));
            }

            const account = await this.addAccount.add({
                name,
                email,
                password,
            });

            return ok(account);
        } catch (error) {
            return serverError(error);
        }
    }
}
