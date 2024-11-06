
export interface HorizontalMenuDataType {
    label: string
    value: string
}

export interface HorizontalMenuIProps{
    menuData: Array<HorizontalMenuDataType>;

    handleClick: (value: string) => void,

    showWhichOne?: string
}


