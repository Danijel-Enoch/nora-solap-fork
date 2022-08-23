import { JupiterProvider } from '@jup-ag/react-hook'
import { useEffect } from 'react'
import useMangoStore from '../stores/useMangoStore'
import PageBodyContainer from '../components/PageBodyContainer'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { actionsSelector, connectionSelector } from '../stores/selectors'
import JupiterForm from '../components/JupiterForm'
import { zeroKey } from '@blockworks-foundation/mango-client'
import { useWallet } from '@solana/wallet-adapter-react'
import GlobeIcon from '@heroicons/react/outline/GlobeIcon'
import dayjs from 'dayjs'
import useLocalStorageState from 'hooks/useLocalStorageState'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'delegate', 'swap', 'profile'])),
      // Will be passed to the page component as props
    },
  }
}

export default function Swap() {
  const connection = useMangoStore(connectionSelector)
  const { connected, publicKey, wallet } = useWallet()
  const actions = useMangoStore(actionsSelector)
  const [savedLanguage] = useLocalStorageState('language', '')

  useEffect(() => {
    dayjs.locale(savedLanguage == 'zh_tw' ? 'zh-tw' : savedLanguage)
  })

  useEffect(() => {
    if (wallet && connected) {
      actions.fetchWalletTokens(wallet)
    }
  }, [connected, actions])

  if (!connection) return null

  const userPublicKey =
    publicKey && !zeroKey.equals(publicKey) ? publicKey : undefined

  return (
    <JupiterProvider
      connection={connection}
      cluster="mainnet-beta"
      userPublicKey={connected ? userPublicKey : undefined}
    >
      <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`} style={{
        minHeight: "775px",
        background: 'url(/solape_images/ape-bg.svg) 150px -56px no-repeat',
        marginBottom: 80,
      }}>

        <PageBodyContainer>
          <div style={{ paddingLeft: "10px", paddingTop: "40px" }}>
            <JupiterForm useSolapeStats={true} />
          </div>
          <div className="flex flex-col-2 -mt-24 md:items-start">
            <a
            className="flex whitespace-nowrap text-xs -mt-20 ml-3 text-th-fgd-2"
            href="https://jup.ag/swap/USDC-SOLAPE"
            target="blank"
            rel="noopener noreferrer"
            >
             <GlobeIcon className="mr-1 h-4 w-4 text-th-fgd-4" />
            Powered by Jupiter
          </a>
            </div>
        </PageBodyContainer>
      </div>
    </JupiterProvider>
  )
}
