import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Edit, Trash2, Clock, Eye } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { ReadingMode } from "@/components/blog/reading-mode";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/post/:id");
  const [, navigate] = useLocation();
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postId = params?.id;

  // Fetch post
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/posts", postId],
    enabled: !!postId,
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("No post ID");
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigate("/");
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-8">
              <div className="bg-slate-200 dark:bg-slate-700 h-6 w-24 rounded mb-6"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full w-20 h-6"></div>
                  <div className="bg-slate-200 dark:bg-slate-700 w-24 h-4 rounded"></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-200 dark:bg-slate-700 h-12 rounded mb-6"></div>
            <div className="bg-slate-200 dark:bg-slate-700 h-6 w-48 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded"></div>
              <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded"></div>
              <div className="bg-slate-200 dark:bg-slate-700 h-4 w-3/4 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Post Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              The post you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/">
              <Button>Back to Posts</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusConfig = {
    published: {
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      label: "Published"
    },
    draft: {
      className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      label: "Draft"
    }
  };

  const status = statusConfig[post.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to posts
            </Button>
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Badge className={cn(status.className, "px-3 py-1 rounded-full text-sm font-medium")}>
                {status.label}
              </Badge>
              <time className="text-slate-500 dark:text-slate-400">
                {formatDate(post.createdAt)}
              </time>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setIsReadingMode(true)}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Reading Mode
              </Button>
              <Link href={`/editor?id=${post.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <article className="prose-blog">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-8 space-x-6">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readingTime || "5 min read"}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              {post.views} views
            </span>
          </div>

          <div 
            className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed space-y-6 prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </article>
      </main>

      {/* Reading Mode */}
      <ReadingMode
        post={post}
        isOpen={isReadingMode}
        onClose={() => setIsReadingMode(false)}
      />
    </div>
  );
}
