import { Link } from "wouter";
import { Edit, Trash2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

interface PostCardProps {
  post: BlogPost;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const statusConfig = {
    published: {
      variant: "default" as const,
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      label: "Published"
    },
    draft: {
      variant: "secondary" as const,
      className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      label: "Draft"
    }
  };

  const status = statusConfig[post.status as keyof typeof statusConfig];

  return (
    <article className="group cursor-pointer animate-slideUp">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg dark:hover:shadow-slate-900/25 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge className={cn(status.className, "px-3 py-1 rounded-full text-sm font-medium")}>
              {status.label}
            </Badge>
            <time className="text-slate-500 dark:text-slate-400 text-sm">
              {formatDate(post.createdAt)}
            </time>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(post);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(post.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Link href={`/post/${post.id}`}>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-6">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {post.readingTime || "5 min read"}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  {post.views} views
                </span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {post.status === "draft" ? "Continue editing →" : "Read more →"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
