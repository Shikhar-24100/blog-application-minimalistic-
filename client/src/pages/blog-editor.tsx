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
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
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
  const { isOwner, isLoading: isAuthLoading } = useOwnerAuth();
  const queryClient = useQueryClient();

  // Redirect non-owners to home
  useEffect(() => {
    if (!isAuthLoading && !isOwner) {
      toast({
        title: "Access denied",
        description: "Only the owner can create and edit posts.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isOwner, isAuthLoading, navigate, toast]);
  
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
    <div className="min-h-screen bg-white dark:bg-background transition-colors duration-300">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors mb-6 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to articles
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
              {isEditing ? "Edit Article" : "Write New Article"}
            </h2>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  const values = form.getValues();
                  console.log("Draft button clicked, form values:", values);
                  if (values.title && values.content) {
                    console.log("Draft validation passed, submitting...");
                    // Auto-generate excerpt from content if empty
                    const finalValues = {
                      ...values,
                      excerpt: values.excerpt || values.content.substring(0, 150) + "..."
                    };
                    onSubmit(finalValues, "draft");
                  } else {
                    console.log("Draft validation failed:", { 
                      hasTitle: !!values.title, 
                      hasContent: !!values.content, 
                      hasExcerpt: !!values.excerpt 
                    });
                    toast({
                      title: "Missing required fields",
                      description: "Please add a title and content to save your draft.",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={isPending}
                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground px-4 py-2 rounded-md border border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-ring transition-all text-sm"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const values = form.getValues();
                  console.log("Button clicked, form values:", values);
                  if (values.title && values.content) {
                    console.log("Validation passed, submitting...");
                    // Auto-generate excerpt from content if empty
                    const finalValues = {
                      ...values,
                      excerpt: values.excerpt || values.content.substring(0, 150) + "..."
                    };
                    onSubmit(finalValues, "published");
                  } else {
                    console.log("Validation failed:", { 
                      hasTitle: !!values.title, 
                      hasContent: !!values.content, 
                      hasExcerpt: !!values.excerpt 
                    });
                    toast({
                      title: "Missing required fields",
                      description: "Please add a title and content to publish your article.",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={isPending}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground px-6 py-2 font-medium transition-colors text-sm rounded-md"
              >
                {isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border">
            {/* Editor Header */}
            <div className="border-b border-gray-200 dark:border-border p-6 space-y-4">
              <Input
                value={form.watch("title")}
                onChange={(e) => form.setValue("title", e.target.value)}
                placeholder="Article title... (required)"
                className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-muted-foreground text-gray-900 dark:text-foreground p-0 focus:ring-0 focus:ring-offset-0 h-auto font-serif"
              />
              <Input
                value={form.watch("excerpt")}
                onChange={(e) => form.setValue("excerpt", e.target.value)}
                placeholder="Brief description..."
                className="w-full text-lg bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-muted-foreground text-gray-600 dark:text-muted-foreground p-0 focus:ring-0 focus:ring-offset-0 h-auto"
              />
            </div>
            
            {/* Editor Content */}
            <RichTextEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
              className="border-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
