import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

interface ReadingModeProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingMode({ post, isOpen, onClose }: ReadingModeProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6 -ml-2"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Reading Mode
          </Button>
        </div>
        
        <article className="prose-blog">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div 
            className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed space-y-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
