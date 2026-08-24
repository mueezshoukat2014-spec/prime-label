import React from "react";
import Link from "next/link";

/**
 * Tiny, dependency-free markdown renderer for blog posts.
 * Supports: ## / ### headings, **bold**, *italic*, [links](url),
 * - bullet lists, 1. numbered lists, > blockquotes, tables (| a | b |),
 * and blank-line paragraphs. Internal links render as <Link>.
 */

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // tokenise links first, then bold/italic inside remaining text
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  const pushText = (chunk: string) => {
    // bold then italic
    const parts = chunk.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
    for (const p of parts) {
      if (p.startsWith("**") && p.endsWith("**")) {
        out.push(<strong key={`${keyBase}-b${i++}`} className="font-semibold text-cream">{p.slice(2, -2)}</strong>);
      } else if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
        out.push(<em key={`${keyBase}-i${i++}`}>{p.slice(1, -1)}</em>);
      } else {
        out.push(<React.Fragment key={`${keyBase}-t${i++}`}>{p}</React.Fragment>);
      }
    }
  };
  while ((m = linkRe.exec(text))) {
    if (m.index > last) pushText(text.slice(last, m.index));
    const href = m[2];
    const label = m[1];
    if (href.startsWith("/")) {
      out.push(
        <Link key={`${keyBase}-l${i++}`} href={href} className="text-champagne underline underline-offset-4 transition-colors hover:text-champagne-bright">
          {label}
        </Link>
      );
    } else {
      out.push(
        <a key={`${keyBase}-l${i++}`} href={href} target="_blank" rel="noopener noreferrer" className="text-champagne underline underline-offset-4 transition-colors hover:text-champagne-bright">
          {label}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // headings
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++} className="display mt-8 text-2xl text-cream">{renderInline(line.slice(4), `h${key}`)}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++} className="display mt-10 text-3xl text-cream">{renderInline(line.slice(3), `h${key}`)}</h2>);
      i++; continue;
    }

    // blockquote
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { quote.push(lines[i].slice(2)); i++; }
      blocks.push(
        <blockquote key={key++} className="mt-6 border-l-2 border-champagne/60 pl-5 text-[15px] italic leading-relaxed text-cream-muted">
          {renderInline(quote.join(" "), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // table
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || "")) {
      const header = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      blocks.push(
        <div key={key++} className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface/50">
                {header.map((h, hi) => (
                  <th key={hi} className="px-4 py-3 font-medium uppercase tracking-wide2 text-[11px] text-champagne">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="px-4 py-3 text-cream-muted">{renderInline(c, `tc${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // bullet list
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      blocks.push(
        <ul key={key++} className="mt-5 space-y-2.5">
          {items.map((it, ii) => (
            <li key={ii} className="flex gap-3 text-[15px] leading-relaxed text-cream-muted">
              <span className="mt-0.5 shrink-0 text-champagne">✦</span>
              <span>{renderInline(it, `li${ii}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      blocks.push(
        <ol key={key++} className="mt-5 list-none space-y-2.5">
          {items.map((it, ii) => (
            <li key={ii} className="flex gap-3 text-[15px] leading-relaxed text-cream-muted">
              <span className="shrink-0 tabular-nums text-champagne">{String(ii + 1).padStart(2, "0")}</span>
              <span>{renderInline(it, `ol${ii}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // paragraph (merge consecutive lines)
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |[-*] |\d+\. |> |\|)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    blocks.push(
      <p key={key++} className="mt-5 text-[15px] leading-relaxed text-cream-muted">
        {renderInline(para.join(" "), `p${key}`)}
      </p>
    );
  }

  return <div>{blocks}</div>;
}
