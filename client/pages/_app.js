import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>HashMarket | Decentralized Commerce</title>
        <meta name="description" content="The world's first hybrid marketplace for physical and digital goods." />
        {/* FAVICON LINK */}
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;