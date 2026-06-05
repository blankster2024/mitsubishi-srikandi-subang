import { useGetPublishedBlogPosts } from "@/hooks/useBlogPosts";
import { FileText } from "lucide-react";
import { motion } from "motion/react";

interface ArtikelTerbaruProps {
  embedded?: boolean;
}

export default function ArtikelTerbaru({
  embedded = false,
}: ArtikelTerbaruProps) {
  const { data: articles = [], isLoading } = useGetPublishedBlogPosts();

  const displayArticles = articles.slice(0, 8);

  const content = (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-5"
      >
        <p className="text-xs font-semibold tracking-widest text-[#C90010] uppercase mb-2">
          Blog
        </p>
        <h2
          className={`font-bold text-gray-900 mb-2 leading-tight ${embedded ? "text-lg md:text-xl" : "text-3xl md:text-4xl"}`}
        >
          Artikel Terbaru
        </h2>
        <p
          className={`text-gray-500 ${embedded ? "text-sm" : "text-base md:text-lg"}`}
        >
          Informasi, tips, dan berita seputar kendaraan Mitsubishi
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-white/60 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : displayArticles.length === 0 ? (
        <div
          data-ocid="artikel.empty_state"
          className="text-center py-8 text-gray-400 text-sm"
        >
          <FileText className="mx-auto mb-2 opacity-40" size={28} />
          <p>Belum ada artikel tersedia.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayArticles.map((article, idx) => (
            <motion.a
              key={article.id.toString()}
              href={`/blog/${article.slug}`}
              data-ocid={`artikel.item.${idx + 1}`}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow group cursor-pointer"
            >
              <FileText
                className="text-[#C90010] flex-shrink-0 mt-0.5"
                size={16}
              />
              <span className="text-sm text-gray-800 group-hover:text-[#C90010] transition-colors font-medium leading-snug line-clamp-2">
                {article.title}
              </span>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="py-10 md:py-12 bg-[#E5E7EB]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">{content}</div>
      </div>
    </section>
  );
}
