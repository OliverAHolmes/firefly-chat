export {};

declare global {
  interface Window {
    pywebview?: {
      api?: {
        chat_with_openai(name: string): Promise<string>;
        // Add any other methods you expose in Python
      };
    };
  }
}