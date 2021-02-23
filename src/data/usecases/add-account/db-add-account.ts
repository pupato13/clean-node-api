import {
    IAddAccount,
    IAddAccountModel,
    IAccountModel,
    IHasher,
    IAddAccountRepository,
} from "./db-add-account-protocols";

export class DbAddAccount implements IAddAccount {
    constructor(
        private readonly hasher: IHasher,
        private readonly addAccountRepository: IAddAccountRepository,
    ) {}

    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const hashedPassword = await this.hasher.hash(accountData.password);

        return await this.addAccountRepository.add(
            // Using {} ensure you don't modify the original Object
            // You create an empty object. Copy accountData to the empty object, then assign hashedPassword to password property.
            Object.assign({}, accountData, { password: hashedPassword }),
        );
    }
}
