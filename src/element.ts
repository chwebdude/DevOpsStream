export class Element {
    // constructor(public html: string, public lastChangedDate: Date){}

    public date!: Date
    public imageUrl!: string;
    public action!: string;
    public user!: string;
    public additionalInfo: string | undefined;
}