 
import type { AppProps } from 'next/app'

import WhatsAppSupportBadge from "../components/support/WhatsAppSupportBadge";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <WhatsAppSupportBadge />
    </>
  )
}

export default MyApp
