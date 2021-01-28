import {
    IController,
    IHttpRequest,
    IHttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

const makeController = (): IController => {
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

    return new ControllerStub();
};

interface ISutTypes {
    sut: LogControllerDecorator;
    controllerStub: IController;
}

const makeSut = (): ISutTypes => {
    const controllerStub = makeController();
    const sut = new LogControllerDecorator(controllerStub);

    return {
        sut,
        controllerStub,
    };
};

describe("Log Controller Decorator", () => {
    test("Should call controller handle", async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, "handle");
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

    test("Should return the same result of the controller", async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@mail.com",
                password: "any_password",
                passwordConfirmation: "any_password",
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual({
            statusCode: 200,
            body: {
                name: "Pupa",
            },
        });
    });
});
