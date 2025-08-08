import { marked } from 'marked';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

// Simple markdown to HTML converter with proper styling
export function parseMarkdown(content: string): string {
  try {
    // Use basic marked parsing first, then apply custom styling
    let html = marked.parse(content) as string;
    
    // Post-process the HTML to add our custom classes
    html = html
      // Headings
      .replace(/<h1>/g, '<h1 class="text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-foreground font-serif">')
      .replace(/<h2>/g, '<h2 class="text-3xl font-bold mb-4 mt-6 text-gray-900 dark:text-foreground font-serif">')
      .replace(/<h3>/g, '<h3 class="text-2xl font-semibold mb-3 mt-4 text-gray-900 dark:text-foreground">')
      .replace(/<h4>/g, '<h4 class="text-xl font-semibold mb-2 mt-3 text-gray-900 dark:text-foreground">')
      .replace(/<h5>/g, '<h5 class="text-lg font-medium mb-2 mt-2 text-gray-900 dark:text-foreground">')
      .replace(/<h6>/g, '<h6 class="text-base font-medium mb-1 mt-1 text-gray-900 dark:text-foreground">')
      // Paragraphs
      .replace(/<p>/g, '<p class="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300">')
      // Strong and emphasis
      .replace(/<strong>/g, '<strong class="font-semibold text-gray-900 dark:text-foreground">')
      .replace(/<em>/g, '<em class="italic text-gray-800 dark:text-gray-200">')
      // Code
      .replace(/<code>/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">')
      .replace(/<pre><code/g, '<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono text-gray-800 dark:text-gray-200"')
      // Links
      .replace(/<a href=/g, '<a class="text-gray-900 dark:text-foreground underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors" href=')
      // Blockquotes
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-r">')
      // Lists
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300">')
      .replace(/<li>/g, '<li class="text-lg leading-relaxed">');
    
    return html;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback to basic HTML conversion
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">$1</code>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-4 mt-6 text-gray-900 dark:text-foreground font-serif">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-semibold mb-3 mt-4 text-gray-900 dark:text-foreground">$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-r">$1</blockquote>')
      .replace(/\n/g, '<br />');
  }
}

// For excerpt rendering (simpler, no styling)
export function parseMarkdownExcerpt(content: string): string {
  try {
    const html = marked.parse(content) as string;
    // Strip HTML tags for excerpt
    return html.replace(/<[^>]*>/g, '');
  } catch (error) {
    console.error('Error parsing markdown excerpt:', error);
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^## (.*$)/gm, '$1')
      .replace(/^### (.*$)/gm, '$1')
      .replace(/^> (.*$)/gm, '$1');
  }
}