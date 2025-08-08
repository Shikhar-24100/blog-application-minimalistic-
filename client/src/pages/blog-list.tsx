import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { PostCard } from "@/components/blog/post-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";

export default function BlogList() {
  const [location, navigate] = useLocation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine if we're showing drafts based on URL
  const isDraftsPage = location === "/drafts";
  
  // Fetch posts
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: searchQuery ? ["/api/posts/search", searchQuery] : ["/api/posts"],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/posts/search?q=${encodeURIComponent(searchQuery)}`
        : "/api/posts";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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

  // Filter posts based on current page and filter selection
  const filteredPosts = posts?.filter(post => {
    if (isDraftsPage && post.status !== "draft") return false;
    if (!isDraftsPage && filter === "published" && post.status !== "published") return false;
    if (!isDraftsPage && filter === "drafts" && post.status !== "draft") return false;
    return true;
  }) || [];

  const handleEdit = (post: BlogPost) => {
    navigate(`/editor?id=${post.id}`);
  };

  const handleDelete = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deleteMutation.mutate(postId);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background transition-colors duration-300">
        <Header onSearch={handleSearch} />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-12">
            <div className="text-center space-y-4 py-8">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-foreground tracking-tight">Articles</h1>
              <p className="text-lg text-gray-600 dark:text-muted-foreground">Loading articles...</p>
            </div>
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-card rounded-lg p-8 border border-gray-200 dark:border-border animate-pulse">
                  <div className="bg-gray-200 dark:bg-muted h-8 rounded mb-3 w-3/4"></div>
                  <div className="bg-gray-200 dark:bg-muted h-16 rounded mb-4"></div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 dark:bg-muted w-20 h-4 rounded"></div>
                    <div className="bg-gray-200 dark:bg-muted w-16 h-4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pageTitle = isDraftsPage ? "Draft Posts" : "Your Blog Posts";
  const postCount = filteredPosts.length;
  const postCountText = isDraftsPage 
    ? `${postCount} ${postCount === 1 ? 'draft' : 'drafts'}`
    : `${postCount} ${postCount === 1 ? 'post' : 'posts'} ${filter === 'all' ? 'total' : filter}`;

  return (
    <div className="min-h-screen bg-white dark:bg-background transition-colors duration-300">
      <Header onSearch={handleSearch} />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          <div className="text-center space-y-4 py-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-foreground tracking-tight">
              {isDraftsPage ? "Drafts" : "Articles"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isDraftsPage 
                ? "Work in progress and unpublished content"
                : "Thoughts, insights, and ideas worth sharing"
              }
            </p>
            {!isDraftsPage && (
              <div className="flex justify-center pt-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48 bg-gray-50 dark:bg-input border-gray-200 dark:border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Articles</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="drafts">Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {searchQuery ? "No posts found" : `No ${isDraftsPage ? 'drafts' : 'posts'} yet`}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchQuery 
                  ? `No posts match "${searchQuery}". Try a different search term.`
                  : `${isDraftsPage ? 'Start writing your first draft' : 'Create your first blog post'} to get started.`
                }
              </p>
              {!searchQuery && (
                <Link href="/editor">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Write Your First Post
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <Link href="/editor">
        <Button className="md:hidden fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 w-14 h-14">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
