import { useState } from 'react';

interface Message {
  role: string;
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isLoading) return;

    // Add user's message to local state
    const newMessages = [
      ...messages,
      { role: 'user', content: trimmed }
    ];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      if (window.pywebview?.api) {
        const assistantReply = await window.pywebview.api.chat_with_openai(trimmed);

        // Add the assistant reply to local state
        const updatedMessages = [
          ...newMessages,
          { role: 'assistant', content: assistantReply }
        ];
        setMessages(updatedMessages);
      } else {
        console.warn('pywebview API not available.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to update messages
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return {
    messages,
    userInput,
    setUserInput,
    isLoading,
    sendMessage,
    updateMessages
  };
}; 