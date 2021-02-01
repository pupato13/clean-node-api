import { MissingParamError } from "../../errors";
import { badRequest } from "../../helpers/http-helper";
import { IController, IHttpRequest, IHttpResponse } from "../../protocols";

export class LoginController implements IController {
    // private readonly emailValidator: IEmailValidator;

    // constructor(emailValidator: IEmailValidator) {
    //     this.emailValidator = emailValidator;
    // }

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        return await new Promise(resolve =>
            resolve(badRequest(new MissingParamError("email"))),
        );
    }
}
