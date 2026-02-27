import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/products";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">The Shoe<span className="gold-text">Blog</span></h1>
        <p className="text-muted-foreground max-w-lg mx-auto">Stories, guides, and insights from the world of footwear</p>
      </motion.div>

      {/* Featured Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <Link to={`/blog/${blogPosts[0].slug}`} className="group grid md:grid-cols-2 gap-6 glass rounded-3xl overflow-hidden">
          <div className="aspect-[16/10] overflow-hidden">
            <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{blogPosts[0].category}</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">{blogPosts[0].title}</h2>
            <p className="text-muted-foreground mb-4">{blogPosts[0].excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {blogPosts[0].author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {blogPosts[0].date}</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {blogPosts.slice(1).map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link to={`/blog/${post.slug}`} className="group block glass rounded-2xl overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">{post.category}</span>
                <h3 className="font-display text-lg font-bold mt-1 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
