import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { coverHosts } from "@/lib/site";
import { mediaIdFromUrl } from "@/lib/cms/content";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-stone max-w-none prose-headings:font-editorial-headline prose-a:text-primary prose-pre:max-w-full prose-pre:overflow-x-auto prose-img:rounded-xl">
      <ReactMarkdown
        skipHtml
        components={{
          h1({ children, node }) {
            return (
              <h2 id={`heading-${node?.position?.start.line}`}>{children}</h2>
            );
          },
          h2({ children, node }) {
            return (
              <h2 id={`heading-${node?.position?.start.line}`}>{children}</h2>
            );
          },
          h3({ children, node }) {
            return (
              <h3 id={`heading-${node?.position?.start.line}`}>{children}</h3>
            );
          },
          img({ src, alt }) {
            if (typeof src !== "string") return null;
            if (mediaIdFromUrl(src)) {
              // The route verifies publication or the administrator session before serving.
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={alt || ""}
                  loading="lazy"
                  className="h-auto max-w-full rounded-xl"
                />
              );
            }
            try {
              const url = new URL(src);
              if (
                url.protocol !== "https:" ||
                !coverHosts.includes(url.hostname)
              )
                return <span>[Image: {alt || "description unavailable"}]</span>;
            } catch {
              return null;
            }
            return (
              <Image
                src={src}
                alt={alt || ""}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto max-w-full"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
