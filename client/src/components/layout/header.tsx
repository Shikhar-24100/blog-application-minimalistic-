import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, BookOpen, Book, Plus, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isOwner, setKey, clearKey, ownerKey } = useOwnerAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKeyPromptOpen, setIsKeyPromptOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [keyInput, setKeyInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKey(keyInput);
    setKeyInput("");
    setIsKeyPromptOpen(false);
  };

  const handleOwnerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsKeyPromptOpen(false);
      setKeyInput("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-background border-b border-gray-200 dark:border-border">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground cursor-pointer tracking-tight">
              MiniBlog
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={cn(
              "text-sm font-medium text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors",
              location === "/" && "text-gray-900 dark:text-foreground"
            )}>
              Articles
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-accent transition-colors"
            title={theme === "light" ? "Switch to reading mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <Book className="h-4 w-4" />
            )}
          </Button>
          
          {isOwner ? (
            <>
              <Link href="/editor">
                <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground px-4 py-2 font-medium text-sm rounded-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Write
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearKey}
                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                title="Sign out as owner"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsKeyPromptOpen(true)}
              className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
              title="Owner access"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-accent">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-md focus:ring-1 focus:ring-gray-900 dark:focus:ring-ring focus:border-gray-900 dark:focus:border-ring text-sm"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}
      
      {/* Owner Key Prompt */}
      {isKeyPromptOpen && (
        <div className="border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-accent">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <form onSubmit={handleKeySubmit} className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="password"
                placeholder="Enter owner key..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={handleOwnerKeyDown}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-md focus:ring-1 focus:ring-gray-900 dark:focus:ring-ring focus:border-gray-900 dark:focus:border-ring text-sm"
                autoFocus
              />
            </form>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
              Enter your owner key to create and edit posts. Press Escape to cancel.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
