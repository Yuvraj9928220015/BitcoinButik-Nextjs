import BlogClient from "./BlogClient";
import { blogs } from "../data";

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function Page({ params }) {
  const { slug } = await params;  // ← Next.js 15 mein params await karna hoga
  return <BlogClient slug={slug} />;
}