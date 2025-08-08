import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseMarkdown } from "@/lib/markdown";
import type { BlogPost } from "@shared/schema";

interface ReadingModeProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingMode({ post, isOpen, onClose }: ReadingModeProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-amber-50 dark:bg-amber-50 z-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center text-amber-800 hover:text-amber-900 transition-colors mb-6 -ml-2 bg-amber-100 hover:bg-amber-200 rounded-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Reading Mode
          </Button>
        </div>
        
        <article className="prose-reading">
          <h1 className="text-5xl font-bold text-amber-900 mb-8 leading-tight font-serif">
            {post.title}
          </h1>
          
          <div 
            className="reading-mode-content text-xl text-amber-800 leading-relaxed space-y-8 font-serif"
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
          />
        </article>
      </div>
    </div>
  );
}
