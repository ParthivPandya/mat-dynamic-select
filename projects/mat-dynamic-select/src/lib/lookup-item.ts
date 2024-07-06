export class LookupItem {
    id: string | undefined;
    name: string | undefined;
    code: string | undefined;
    isDisabled?: boolean = false;
    toolTip?: string;
    colorCode?: string;
    childs: LookupItem[] | undefined;
}