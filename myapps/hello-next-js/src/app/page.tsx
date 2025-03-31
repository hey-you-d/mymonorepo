import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { MONOREPO_PREFIX } from "../../constants/common";
import HomepageLink from "../../components/HomepageLink";
import { ReactElement } from "react";

export default function Home() {
  type LinkAttributes = {
    title: string,
    href: string,
  }
  const contentLinks: Record<string, LinkAttributes> = {
    mvvmFetchAxios: { title: "MVVM Pattern/Fetching with Axios", href: "/mvvm-fetch-axios" },
    mvvmBasicRedux: { title: "MVVM Pattern/Basic Redux", href:"/mvvm-basic-redux" }, 
    exampleMySharedUI: { title: "Example/My Shared UI package", href:"/example-my-shared-ui" },   
  }

  const renderedLinks: ReactElement[] = [];
  Object.keys(contentLinks).forEach((key) => {
    return renderedLinks.push(<HomepageLink key={key} href={contentLinks[key].href} title={contentLinks[key].title} />);
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Hello-Next-JS</h1>
        <Image
          className={styles.logo}
          src={`${MONOREPO_PREFIX}/next.svg`}
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src={`${MONOREPO_PREFIX}/vercel.svg`}
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>

      </main>
      <footer className={styles.footer}>
        <Link
          href="/"
          target="_self"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={`${MONOREPO_PREFIX}/globe.svg`}
            alt="Globe icon"
            width={16}
            height={16}
          />
          Back to hello-react-js →
        </Link>
        {renderedLinks}
      </footer>
    </div>
  );
}
