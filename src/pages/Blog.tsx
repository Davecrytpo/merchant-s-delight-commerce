import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/products";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">The Shoe<span className="gold-text">Blog</span></h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">Stories, guides, and insights from the world of footwear</p>
      </motion.div>

      {/* Featured Post */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 md:mb-12">
        <Link to={`/blog/${blogPosts[0].slug}`} className="group grid md:grid-cols-2 gap-0 md:gap-6 glass rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="aspect-[16/10] overflow-hidden">
            <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center">
            <span className="text-primary text-xs md:text-sm font-semibold uppercase tracking-wider">{blogPosts[0].category}</span>
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold mt-1 md:mt-2 mb-2 md:mb-3 group-hover:text-primary transition-colors">{blogPosts[0].title}</h2>
            <p className="text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">{blogPosts[0].excerpt}</p>
            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3 md:w-3.5 md:h-3.5" /> {blogPosts[0].author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> {blogPosts[0].date}</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {blogPosts.slice(1).map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Link to={`/blog/${post.slug}`} className="group block glass rounded-xl md:rounded-2xl overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-4 md:p-5">
                <span className="text-primary text-[10px] md:text-xs font-semibold uppercase tracking-wider">{post.category}</span>
                <h3 className="font-display text-base md:text-lg font-bold mt-1 mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-primary text-xs md:text-sm font-medium">Read More <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" /></div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
