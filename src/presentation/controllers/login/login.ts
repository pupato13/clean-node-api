import { IAuthentication } from "../../../domain/usecases/authentication";
import { InvalidParamError, MissingParamError } from "../../errors";
import { badRequest, serverError } from "../../helpers/http-helper";
import { IController, IHttpRequest, IHttpResponse } from "../../protocols";
import { IEmailValidator } from "../../protocols/email-validator";

export class LoginController implements IController {
    private readonly emailValidator: IEmailValidator;
    private readonly authentication: IAuthentication;

    constructor(
        emailValidator: IEmailValidator,
        authentication: IAuthentication,
    ) {
        this.emailValidator = emailValidator;
        this.authentication = authentication;
    }

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const { email, password } = httpRequest.body;

            if (!email) {
                return badRequest(new MissingParamError("email"));
            }

            if (!password) {
                return badRequest(new MissingParamError("password"));
            }

            const isValid = this.emailValidator.isValid(email);

            if (!isValid) {
                return badRequest(new InvalidParamError("email"));
            }

            await this.authentication.auth(email, password);
        } catch (error) {
            return serverError(error);
        }
    }
}
