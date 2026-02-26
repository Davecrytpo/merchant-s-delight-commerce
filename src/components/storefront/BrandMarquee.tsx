const brands = [
  "SHOESHOP", "RUNNER PRO", "URBAN WALKER", "HERITAGE", "TRAIL BLAZER",
  "FLEX TRAINER", "CANVAS CLASSIC", "SHOESHOP", "RUNNER PRO", "URBAN WALKER",
  "HERITAGE", "TRAIL BLAZER", "FLEX TRAINER", "CANVAS CLASSIC",
];

export default function BrandMarquee() {
  return (
    <section className="py-12 border-y border-border overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {brands.map((brand, i) => (
          <span
            key={i}
            className="mx-12 text-4xl md:text-6xl font-heading font-bold text-muted-foreground/10 hover:text-muted-foreground/30 transition-colors duration-500 select-none cursor-default"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}
