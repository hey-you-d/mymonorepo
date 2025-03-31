import Link from 'next/link';
import Image from 'next/image';
import { IMAGE_PREFIX } from '../constants/common';
import styles from "@/app/page.module.css";

const HomepageLink = ({ href, title } : { href: string, title: string }) => {
    return (
        <Link href={href} 
          target="_self"
          rel="noopener noreferrer"
          className={styles.secondary}>
            <Image
              aria-hidden
              src={`${IMAGE_PREFIX}/file.svg`}
              alt="File icon"
              width={16}
              height={16}
            />
            {title}
        </Link>
    );
}

export default HomepageLink;