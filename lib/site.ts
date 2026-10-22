export const site = {
  name: "The Journal",
  description:
    "Thoughtful writing on technology, creativity, and the ideas shaping tomorrow.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  author: process.env.NEXT_PUBLIC_AUTHOR_NAME || "The Journal Editor",
};

export const categories = [
  "Technology",
  "Software Engineering",
  "Tutorials",
  "Career",
  "Personal Notes",
] as const;
export const coverHosts = [
  "images.unsplash.com",
  "picsum.photos",
  "lh3.googleusercontent.com",
  "tgfhjjiojftvidofzxji.supabase.co",
];
