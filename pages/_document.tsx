import { Html, Head, Main, NextScript } from 'next/document';
import { MixpanelScript } from '@lightspeed/react-mixpanel-script';
type MyDocumentProps = {
  nonce: string;
};
export default function Document() {
  return (
    <Html lang="en">
      <Head />
        
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=G-1CXZL8CV0L`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1CXZL8CV0L', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
