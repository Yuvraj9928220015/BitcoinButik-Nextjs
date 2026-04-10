"use client";
import { useRouter } from "next/navigation";
import { blogs } from "./data";  // ← yahi ek change hai
import "./blog.css";


export default function BlogListPage() {
  const router = useRouter();

  const openBlog = (blog) => {
    router.push(`/blog/${blog.slug}`);
  };



  return (
    <div className="Blog">
      <div className="Blog-line"></div>
      <div className="Blog-container-Box-Image">
        <div className="container">
          <div className="row">
            <div className="About-title">
              <h2>Latest Blogs</h2>
            </div>
            {blogs.map((blog) => (
              <div
                className="col-lg-4 col-md-4 col-sm-12 col-12"
                key={blog.slug}
              >
                <div className="Blog-Section" onClick={() => openBlog(blog)}>
                  <div className="blog-img-wrapper">
                    <img src={blog.image} alt={blog.altTag || blog.title} />
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span>{blog.author}</span>
                      <span>{blog.date}</span>
                    </div>
                    <div className="Blog-title">{blog.heading}</div>
                    <div className="Blog-des">{blog.subHeading}</div>
                    <div className="blog-btn">
                      <span>Read More →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}