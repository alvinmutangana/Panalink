import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getDict, getLang } from "../lib/i18n";
import { getShell } from "../lib/shell-i18n";
import LangSelect from "./LangSelect";
import LangSync from "./LangSync";
import MobileMenu from "./MobileMenu";

const CATS = ["agriculture", "crafts", "food", "other"] as const;

const link =
  "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-secondary";
const cta =
  "inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90";

export default async function SiteHeader() {
  const h = await headers();
  const [session, t, s, lang] = await Promise.all([
    auth.api.getSession({ headers: h }),
    getDict(),
    getShell(),
    getLang(),
  ]);

  const user = session?.user;
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";

  const links = (
    <>
      <a href="/listings" className={link}>{s.browse}</a>
      {!user && <a href="/signup" className={link}>{s.sell}</a>}
      {isSeller && <a href="/listings/new" className={link}>{s.sell}</a>}
      {user && <a href="/messages" className={link}>{s.messages}</a>}
      {user && <a href="/orders" className={link}>{s.orders}</a>}
      {isAdmin && <a href="/admin" className={link}>{s.admin}</a>}
      {user ? (
        <a href="/dashboard" className={cta}>{s.account}</a>
      ) : (
        <>
          <a href="/login" className={link}>{s.login}</a>
          <a href="/signup" className={cta}>{s.signup}</a>
        </>
      )}
    </>
  );

  return (
    <>
      <LangSync lang={lang} />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {s.skip}
      </a>

      <header className="border-b bg-background">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-3 md:flex-nowrap md:gap-x-6">
          <a href="/" className="text-xl font-semibold tracking-tight text-primary">
            PanaLink
          </a>

          <form
            action="/listings"
            method="GET"
            role="search"
            className="order-last w-full md:order-none md:max-w-xl md:flex-1"
          >
            <label htmlFor="site-search" className="sr-only">
              {s.searchLabel}
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder={s.searchPlaceholder}
              className="min-h-11 w-full rounded-md border px-4"
            />
          </form>

          <nav aria-label={s.main} className="ml-auto hidden items-center gap-1 md:flex">
            {links}
            <div className="ml-2">
              <LangSelect current={lang} label={s.language} />
            </div>
          </nav>

          <div className="ml-auto md:hidden">
            <MobileMenu label={s.menu}>
              <nav aria-label={s.main} className="flex flex-col">
                {links}
              </nav>
              <div className="mt-2 border-t px-1 pt-3">
                <LangSelect current={lang} label={s.language} />
              </div>
            </MobileMenu>
          </div>
        </div>

        <nav aria-label={s.categories} className="border-t">
          <ul className="container-page flex gap-1 overflow-x-auto py-1 text-sm">
            <li className="shrink-0">
              <a href="/listings" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-md px-3 font-medium hover:bg-secondary">
                {s.all}
              </a>
            </li>
            {CATS.map((c) => (
              <li key={c} className="shrink-0">
                <a
                  href={`/listings?category=${c}`}
                  className="inline-flex min-h-10 items-center whitespace-nowrap rounded-md px-3 hover:bg-secondary"
                >
                  {t.categories[c]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
