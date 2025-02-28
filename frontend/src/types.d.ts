interface PyWebviewApi {
  chat_with_openai(message: string): Promise<string>;
  create_new_session(): Promise<{ session_id: number }>;
  get_sessions(): Promise<Array<{
    id: number;
    title: string;
    created_at: string;
  }>>;
  load_session(sessionId: number): Promise<Array<{
    role: string;
    content: string;
  }>>;
  delete_session(sessionId: number): Promise<{ success: boolean }>;
  rename_session(sessionId: number, newTitle: string): Promise<{
    success: boolean;
    title?: string;
    error?: string;
  }>;
}

interface Window {
  pywebview?: {
    api: PyWebviewApi;
  };
}