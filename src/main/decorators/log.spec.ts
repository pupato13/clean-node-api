import {
    IController,
    IHttpRequest,
    IHttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

describe("Log Controller Decorator", () => {
    test("Should call controller handle", async () => {
        class ControllerStub implements IController {
            async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
                const httpResponse: IHttpResponse = {
                    statusCode: 200,
                    body: {
                        name: "Pupa",
                    },
                };
                return await new Promise(resolve => resolve(httpResponse));
            }
        }

        const controllerStub = new ControllerStub();
        const handleSpy = jest.spyOn(controllerStub, "handle");
        const sut = new LogControllerDecorator(controllerStub);
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@mail.com",
                password: "any_password",
                passwordConfirmation: "any_password",
            },
        };

        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });
});
