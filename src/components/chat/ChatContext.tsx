"use-client";
import { useState } from "react";
import { createContext } from "vm";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { send } from "process";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event:React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean,
};

export const chatContext = createContext({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false,
})

interface ChatContextProviderProps {
    fileId: string,
    children: React.ReactNode,
}

export const ChatContextProvider = ({fileId, children}: ChatContextProviderProps) =>{
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {toast} = useToast();

    const {mutate: sendMessage} = useMutation({
        mutationFn: async({message}: {message: string}) => {

            const response = await fetch(`/api/message`, {
                method: 'POST',
                body: JSON.stringify({fileId, message}),
            }) 
            if(!response.ok){
                throw new Error('Faild to add message')
            }
            return response.body;  

        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    const addMessage = () => sendMessage({message});

    
    return(
        <chatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading,
        }}>
            {children}
        </chatContext.Provider>
    )

} 