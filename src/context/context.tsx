import React from "react";

export const EditTreeContext = React.createContext<{ 
    clickTreeMenu: ((key: string, label: string, value?: string, isEntity?: boolean) => void) | null,
    addNextTreeMenu: ((key: string, label: string) => void) | null, 
    editTreeMenu: ((key: string, label: string) => void) | null , 
    deleteTreeMenu: ((key: string, label: string) => void) | null,
    highLightId?: string ,
    showOperation?: boolean,

 }>({
        
    clickTreeMenu: null,
    addNextTreeMenu: null,
    editTreeMenu: null,
    deleteTreeMenu: null,
    highLightId: "",
    showOperation: true,
})
