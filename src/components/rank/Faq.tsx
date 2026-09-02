import { useState } from "react";
import { FAQ_ITEMS, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export function Faq({ withSchema = false }: { withSchema?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="faq" aria-labelledby="faq-heading" className="faq glass-card rounded-2xl p-6 sm:p-8">
      {withSchema && <JsonLd data={faqJsonLd()} />}
      <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">FAQ</p>
      <h2 id="faq-heading" className="mt-1 font-display text-2xl font-extrabold tracking-tight text-fg">
        Q&A
      </h2>
      <div className="mt-4">
        {FAQ_ITEMS.map((item) => {
          const on = open === item.q;
          return (
            <div key={item.q} className="faq-item">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : item.q)}
              >
                <h3 className="m-0 text-left text-[15px] font-bold text-fg">{item.q}</h3>
                <span className={`faq-plus ${on ? "is-open" : ""}`} aria-hidden>
                  +
                </span>
              </button>
              <div className={`faq-body ${on ? "is-open" : ""}`}>
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
