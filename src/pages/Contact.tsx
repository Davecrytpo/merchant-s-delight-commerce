import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Get in <span className="gold-text">Touch</span></h1>
        <p className="text-muted-foreground max-w-lg mx-auto">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Mail, title: "Email", info: "hello@shoeshop.com", sub: "We reply within 24 hours" },
          { icon: Phone, title: "Phone", info: "+1 (555) 123-4567", sub: "Mon-Fri 9am-6pm EST" },
          { icon: MapPin, title: "Address", info: "123 Fashion Ave", sub: "New York, NY 10001" },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="glass rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-5 h-5 text-background" />
            </div>
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-foreground">{item.info}</p>
            <p className="text-sm text-muted-foreground">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto glass rounded-2xl p-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <input className={inputClass} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <textarea className={`${inputClass} min-h-[150px] resize-none`} placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button type="submit" disabled={submitting} className="gold-gradient text-background font-semibold w-full py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
          <Send className="w-4 h-4" /> {submitting ? "Sending..." : "Send Message"}
        </button>
      </motion.form>
    </div>
  );
}
