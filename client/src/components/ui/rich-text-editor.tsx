import { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  Link, 
  Quote, 
  Code, 
  Image, 
  List 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your post...",
  className 
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    const words = newValue.trim() ? newValue.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    handleTextChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertText("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertText("_", "_"), title: "Italic" },
    { icon: Underline, action: () => insertText("<u>", "</u>"), title: "Underline" },
    { icon: Heading, action: () => insertText("## "), title: "Heading" },
    { icon: Link, action: () => insertText("[", "](url)"), title: "Link" },
    { icon: Quote, action: () => insertText("> "), title: "Quote" },
    { icon: Code, action: () => insertText("`", "`"), title: "Code" },
    { icon: List, action: () => insertText("- "), title: "List" },
  ];

  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className={cn("bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700", className)}>
      {/* Editor Toolbar */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {formatButtons.slice(0, 3).map(({ icon: Icon, action, title }) => (
                <Button
                  key={title}
                  variant="ghost"
                  size="icon"
                  onClick={action}
                  title={title}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              {formatButtons.slice(3, 7).map(({ icon: Icon, action, title }) => (
                <Button
                  key={title}
                  variant="ghost"
                  size="icon"
                  onClick={action}
                  title={title}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                title="Image"
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                onClick={() => insertText("![alt text](image-url)")}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="List"
                onClick={formatButtons[7].action}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>~{readingTime} min read</span>
          </div>
        </div>
      </div>
      
      {/* Editor Content Area */}
      <div className="p-6">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-96 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:ring-0 focus:ring-offset-0"
        />
      </div>
    </div>
  );
}
