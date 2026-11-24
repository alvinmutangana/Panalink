import { getDict, getLang } from "../lib/i18n";
import { getShell } from "../lib/shell-i18n";
import LangSelect from "./LangSelect";

const CATS = ["agriculture", "crafts", "food", "other"] as const;
const item =
  "inline-block py-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground hover:underline";

function Col({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <ul className="mt-3 flex flex-col">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <a href={l.href} className={item}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SiteFooter() {
  const [t, s, lang] = await Promise.all([getDict(), getShell(), getLang()]);

  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">PanaLink</p>
          <p className="mt-2 max-w-xs text-sm text-primary-foreground/80">
            {s.tagline}
          </p>
        </div>

        <Col
          title={s.marketplace}
          links={[
            { href: "/listings", label: s.browse },
            ...CATS.map((c) => ({
              href: `/listings?category=${c}`,
              label: t.categories[c],
            })),
          ]}
        />

        <Col
          title={s.sellers}
          links={[
            { href: "/signup", label: s.startSelling },
            { href: "/verify", label: s.getVerified },
          ]}
        />

        <div>
          <Col
            title={s.accountCol}
            links={[
              { href: "/login", label: s.login },
              { href: "/signup", label: s.signup },
              { href: "/orders", label: s.orders },
              { href: "/messages", label: s.messages },
            ]}
          />
          <div className="mt-6">
            <LangSelect current={lang} label={s.language} />
          </div>
        </div>
      </div>
    </footer>
  );
}
