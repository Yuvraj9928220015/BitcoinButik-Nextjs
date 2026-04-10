"use client";
import { useRouter } from "next/navigation";
import { blogs } from "../data";
import "../blog.css";

export default function BlogClient({ slug }) {
  const router = useRouter();

  const selectedBlog = blogs.find((b) => b.slug === slug);

  if (!selectedBlog) {
    return (
      <div className="Blog">
        <div className="Blog-line"></div>
        <div className="BlogDetail-wrapper">
          <button className="back-btn" onClick={() => router.push("/blog")}>
            ← Back to Blogs
          </button>
          <h2>Blog not found.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="Blog">
      <div className="Blog-line"></div>
      <div className="BlogDetail-wrapper">
        <button className="back-btn" onClick={() => router.push("/blog")}>
          ← Back to Blogs
        </button>

        <div className="BlogDetail-hero">
          <img
            src={selectedBlog.image}
            alt={selectedBlog.altTag || selectedBlog.title}
          />
          <div className="BlogDetail-hero-overlay"></div>
        </div>

        <div className="BlogDetail-body">
          <div
            className="BlogDetail-content"
            dangerouslySetInnerHTML={{ __html: selectedBlog.contentHTML }}
          />
          {selectedBlog.hashtags && (
            <div className="BlogDetail-hashtags">
              {selectedBlog.hashtags.map((tag) => (
                <span key={tag} className="hashtag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}