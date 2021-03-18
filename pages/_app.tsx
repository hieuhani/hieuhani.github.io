import Head from 'next/head'
import { AppProps } from 'next/app'
import { MainLayout } from '@/components/layouts/MainLayout'
import '../styles/globals.css'

const MyApp: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return (
    <MainLayout>
      <Head>
        <title>hieuhani</title>
      </Head>
      <Component {...pageProps} />
    </MainLayout>
  )
}

export default MyApp
