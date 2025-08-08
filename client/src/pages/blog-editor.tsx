import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Header } from "@/components/layout/header";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogPostSchema, updateBlogPostSchema } from "@shared/schema";
import type { BlogPost, InsertBlogPost, UpdateBlogPost } from "@shared/schema";
import { z } from "zod";

const editorFormSchema = insertBlogPostSchema.extend({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z.string().min(1, "Excerpt is required").max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
});

type EditorFormData = z.infer<typeof editorFormSchema>;

export default function BlogEditor() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse the post ID from URL params
  const urlParams = new URLSearchParams(searchParams);
  const editPostId = urlParams.get("id");
  const isEditing = !!editPostId;

  // Fetch existing post if editing
  const { data: existingPost, isLoading: isLoadingPost } = useQuery<BlogPost>({
    queryKey: ["/api/posts", editPostId],
    enabled: isEditing,
  });

  const form = useForm<EditorFormData>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      status: "draft",
    },
  });

  // Update form when existing post is loaded
  useEffect(() => {
    if (existingPost && isEditing) {
      form.reset({
        title: existingPost.title,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        status: existingPost.status as "draft" | "published",
      });
    }
  }, [existingPost, isEditing, form]);

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: (newPost: BlogPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigate(`/post/${newPost.id}`);
      toast({
        title: "Post created",
        description: `Your ${newPost.status} has been saved successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBlogPost) => {
      if (!editPostId) throw new Error("No post ID");
      const response = await apiRequest("PATCH", `/api/posts/${editPostId}`, data);
      return response.json();
    },
    onSuccess: (updatedPost: BlogPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", editPostId] });
      navigate(`/post/${updatedPost.id}`);
      toast({
        title: "Post updated",
        description: `Your ${updatedPost.status} has been updated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditorFormData, status: "draft" | "published") => {
    const postData = { ...data, status };
    
    if (isEditing) {
      updateMutation.mutate(postData);
    } else {
      createMutation.mutate(postData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingPost) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-slate-200 dark:bg-slate-700 h-6 w-24 rounded mb-6"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="bg-slate-200 dark:bg-slate-700 h-8 w-48 rounded"></div>
              <div className="flex space-x-4">
                <div className="bg-slate-200 dark:bg-slate-700 h-10 w-24 rounded"></div>
                <div className="bg-slate-200 dark:bg-slate-700 h-10 w-20 rounded"></div>
              </div>
            </div>
            <div className="bg-slate-200 dark:bg-slate-700 h-96 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Post" : "Create New Post"}
            </h2>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => onSubmit(form.getValues(), "draft")}
                disabled={isPending || !form.formState.isValid}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                Save Draft
              </Button>
              <Button
                onClick={() => onSubmit(form.getValues(), "published")}
                disabled={isPending || !form.formState.isValid}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium transition-colors"
              >
                {isPending ? "Saving..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {/* Editor Header */}
              <div className="border-b border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Post title..."
                          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 p-0 focus:ring-0 focus:ring-offset-0 h-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Brief description or excerpt..."
                          className="w-full text-lg bg-transparent border-none outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-600 dark:text-slate-400 p-0 focus:ring-0 focus:ring-offset-0 h-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Editor Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        className="border-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
