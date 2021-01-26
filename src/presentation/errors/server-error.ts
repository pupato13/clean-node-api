export class ServerError extends Error {
    constructor() {
        super("An error occurred processing your request. Please, try again!");
        this.name = "ServerError";
    }
}
