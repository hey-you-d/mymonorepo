import Image from 'next/image';
import Link from 'next/link';
import styles from "@/app/page.module.css";
import { MONOREPO_PREFIX } from '../constants/common';


const Footer = () => {
    return (
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
        </footer>
    )
}

export default Footer;