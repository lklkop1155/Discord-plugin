import { before } from '@vendetta/patcher';
import { findByProps, findByStoreName } from '@vendetta/metro';
import { FluxDispatcher, React } from '@vendetta/metro/common';

const MessageStore = findByStoreName("MessageStore");

// Note: In React Native Discord, we can't easily inject raw CSS like desktop.
// Instead, we append a marker or use Discord's built-in formatting if available.
// However, many mobile mods support simple markdown or specific properties.

export default {
    onLoad() {
        console.log("RedMessageLogger loaded");
        
        this.unpatch = before("dispatch", FluxDispatcher, (args) => {
            const [event] = args;
            
            if (event.type === "MESSAGE_DELETE") {
                const msg = MessageStore.getMessage(event.channelId, event.id);
                
                if (!msg) return args;

                // Create a copy of the message to modify
                const modifiedMessage = { ...msg };
                
                // Add a visual indicator for deleted messages
                // We use ANSI-like escape codes if supported, or just clear text markers
                // For mobile, appending a clear tag is the most compatible way
                modifiedMessage.content = `[DELETED] ${msg.content}`;
                
                // Set a flag that some themes/plugins use for coloring
                modifiedMessage.isDeleted = true; 

                // Dispatch as UPDATE instead of letting it DELETE
                args[0] = {
                    type: "MESSAGE_UPDATE",
                    channelId: event.channelId,
                    message: modifiedMessage
                };
                
                return args;
            }
        });
    },

    onUnload() {
        this.unpatch?.();
        console.log("RedMessageLogger unloaded");
    }
};
