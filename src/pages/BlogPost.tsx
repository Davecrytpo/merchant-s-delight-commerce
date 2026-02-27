import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/products";
import { Calendar, User, ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-primary underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">{post.category}</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
        </div>
        <div className="rounded-2xl overflow-hidden mb-8">
          <img src={post.image} alt={post.title} className="w-full h-[400px] object-cover" />
        </div>
        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>{post.content}</p>
          <p>At ShoeShop, we believe in transparency and education. Understanding the technology behind your footwear helps you make better purchasing decisions and get the most out of every pair.</p>
          <p>Stay tuned for more in-depth articles about footwear technology, style guides, and industry trends. Follow us on social media to never miss an update.</p>
        </div>
      </motion.article>
    </div>
  );
}
