import {
    IAddAccount,
    IAddAccountModel,
    IAccountModel,
    IEncrypter,
    IAddAccountRepository,
} from "./db-add-account-protocols";

export class DbAddAccount implements IAddAccount {
    private readonly encrypter: IEncrypter;
    private readonly addAccountRepository: IAddAccountRepository;

    constructor(
        encrypter: IEncrypter,
        addAccountRepository: IAddAccountRepository,
    ) {
        this.encrypter = encrypter;
        this.addAccountRepository = addAccountRepository;
    }

    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const hashedPassword = await this.encrypter.encrypt(
            accountData.password,
        );

        return await this.addAccountRepository.add(
            // Using {} ensure you don't modify the original Object
            // You create an empty object. Copy accountData to the empty object, then assign hashedPassword to password property.
            Object.assign({}, accountData, { password: hashedPassword }),
        );
    }
}
