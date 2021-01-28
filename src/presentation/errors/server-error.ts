export class ServerError extends Error {
    constructor(stack: string) {
        super("An error occurred processing your request. Please, try again!");
        this.name = "ServerError";
        this.stack = stack;
    }
}
