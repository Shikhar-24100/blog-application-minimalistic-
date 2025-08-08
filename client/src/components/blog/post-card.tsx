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
      <div className="bg-white dark:bg-card rounded-lg p-8 border border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-ring hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Badge className={cn(status.className, "px-3 py-1 rounded-full text-sm font-medium")}>
              {status.label}
            </Badge>
            <time className="text-gray-500 dark:text-muted-foreground text-sm">
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
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-all"
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
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Link href={`/post/${post.id}`}>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors font-serif">
              {post.title}
            </h3>
            
            <p className="text-gray-600 dark:text-muted-foreground text-lg leading-relaxed mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground">
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
              <span className="text-gray-900 dark:text-foreground font-medium">
                {post.status === "draft" ? "Continue editing →" : "Read article →"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
