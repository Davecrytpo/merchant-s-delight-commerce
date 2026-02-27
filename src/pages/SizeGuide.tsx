import { motion } from "framer-motion";
import { Ruler } from "lucide-react";

const sizes = [
  { us: "7", uk: "6", eu: "40", cm: "25" },
  { us: "7.5", uk: "6.5", eu: "40.5", cm: "25.5" },
  { us: "8", uk: "7", eu: "41", cm: "26" },
  { us: "8.5", uk: "7.5", eu: "42", cm: "26.5" },
  { us: "9", uk: "8", eu: "42.5", cm: "27" },
  { us: "9.5", uk: "8.5", eu: "43", cm: "27.5" },
  { us: "10", uk: "9", eu: "44", cm: "28" },
  { us: "10.5", uk: "9.5", eu: "44.5", cm: "28.5" },
  { us: "11", uk: "10", eu: "45", cm: "29" },
  { us: "11.5", uk: "10.5", eu: "45.5", cm: "29.5" },
  { us: "12", uk: "11", eu: "46", cm: "30" },
];

export default function SizeGuide() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
          <Ruler className="w-8 h-8 text-background" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">Size <span className="gold-text">Guide</span></h1>
        <p className="text-muted-foreground">Find your perfect fit with our comprehensive size chart</p>
      </motion.div>

      {/* How to measure */}
      <motion.div className="glass rounded-2xl p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display text-xl font-bold mb-4">How to Measure Your Foot</h2>
        <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
          <li>Place a piece of paper on the floor against a wall.</li>
          <li>Stand on the paper with your heel against the wall.</li>
          <li>Mark the longest point of your foot on the paper.</li>
          <li>Measure the distance from the wall to the mark in centimeters.</li>
          <li>Use the chart below to find your size.</li>
        </ol>
        <p className="text-sm text-primary mt-4">💡 Tip: Measure in the afternoon when your feet are slightly larger.</p>
      </motion.div>

      {/* Size Chart */}
      <motion.div className="glass rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-6 text-left text-sm font-bold uppercase text-primary">US</th>
              <th className="py-4 px-6 text-left text-sm font-bold uppercase text-primary">UK</th>
              <th className="py-4 px-6 text-left text-sm font-bold uppercase text-primary">EU</th>
              <th className="py-4 px-6 text-left text-sm font-bold uppercase text-primary">CM</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-6 font-medium">{s.us}</td>
                <td className="py-3 px-6 text-muted-foreground">{s.uk}</td>
                <td className="py-3 px-6 text-muted-foreground">{s.eu}</td>
                <td className="py-3 px-6 text-muted-foreground">{s.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
