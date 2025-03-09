import { Box, Typography, Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React from "react";

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
  };
}


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        justifyContent: message.role === "user" ? "flex-end" : "flex-start",
        padding: "8px 16px",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: "80%",
          width: "100%",
          bgcolor: message.role === "user" ? "#1976d2" : "#444654",
          color: "white",
          borderRadius:
            message.role === "user"
              ? "20px 20px 5px 20px"
              : "20px 20px 20px 5px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          p: 2,
          userSelect: "text",
          "& pre": {
            backgroundColor: "rgba(0,0,0,0.2)",
            padding: "0.75rem",
            borderRadius: "4px",
            overflowX: "auto",
            position: "relative",
            "& .copy-button": {
              opacity: 0,
            },
            "&:hover .copy-button": {
              opacity: 1,
            },
          },
          "& code": {
            backgroundColor: "rgba(0,0,0,0.2)",
            padding: "0.2rem 0.4rem",
            borderRadius: "4px",
            fontSize: "0.875em",
          },
        }}
      >
        {message.role === "user" ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <Typography variant="body1" gutterBottom>
                  {children}
                </Typography>
              ),
              h1: ({ children }) => (
                <Typography variant="h4" gutterBottom>
                  {children}
                </Typography>
              ),
              h2: ({ children }) => (
                <Typography variant="h5" gutterBottom>
                  {children}
                </Typography>
              ),
              h3: ({ children }) => (
                <Typography variant="h6" gutterBottom>
                  {children}
                </Typography>
              ),
              li: ({ children }) => (
                <Typography component="li" style={{ marginLeft: "1rem" }}>
                  {children}
                </Typography>
              ),
              pre: ({ children }) => {
                // Extract code content from the nested structure
                const codeElement = React.Children.toArray(
                  children
                )[0] as React.ReactElement<{children?: string}>;
                const codeContent = codeElement?.props?.children || "";

                return (
                  <Box component="pre" sx={{ position: "relative" }}>
                    <Button
                      className="copy-button"
                      onClick={() =>
                        copyToClipboard(
                          typeof codeContent === "string"
                            ? codeContent
                            : String(codeContent)
                        )
                      }
                      sx={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        minWidth: "32px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        bgcolor: "rgba(0,0,0,0.2)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.4)",
                        },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </Button>
                    {children}
                  </Box>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {message.role === "user" ? "You" : "Assistant"}
        </Typography>
      </Box>
    </Box>
  );
};
