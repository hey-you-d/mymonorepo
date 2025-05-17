import { memo } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { MONOREPO_PREFIX } from '@/lib/app/common';
import styles from "@/app/page.module.css";

const HomepageLink = ({ href, title } : { href: string, title: string }) => {
    return (
        <Link href={`${MONOREPO_PREFIX}/${href}`} 
          target="_self"
          rel="noopener noreferrer"
          className={styles.secondary}>
            <Image
              aria-hidden
              src={`${MONOREPO_PREFIX}/file.svg`}
              alt="File icon"
              width={16}
              height={16}
            />
            {title}
        </Link>
    );
}

export default memo(HomepageLink);