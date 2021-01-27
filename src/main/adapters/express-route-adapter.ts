import { Request, Response, RequestHandler } from "express";
import { IController, IHttpRequest } from "../../presentation/protocols";

export const adaptRoute = (controller: IController): RequestHandler => {
    return async (req: Request, res: Response) => {
        const httpRequest: IHttpRequest = {
            body: req.body,
        };

        const httpResponse = await controller.handle(httpRequest);

        res.status(httpResponse.statusCode).json(httpResponse.body);
    };
};
