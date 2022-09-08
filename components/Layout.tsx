import { breakpoints } from '../components/TradePageGrid'
import { useViewport } from 'hooks/useViewport'
import BottomBar from './mobile/BottomBar'
import { ConnectWalletButton } from './ConnectWalletButton'
import GlobalNotification from './GlobalNotification'
import useMangoAccount from 'hooks/useMangoAccount'
import { abbreviateAddress } from 'utils'
import { useCallback, useEffect, useState } from 'react'
import AccountsModal from './AccountsModal'
import { useRouter } from 'next/router'
import FavoritesShortcutBar from './FavoritesShortcutBar'
import {
  CogIcon,
} from '@heroicons/react/solid'
import { IconButton } from './Button'
import SettingsModal from './SettingsModal'
import { useTranslation } from 'next-i18next'
import { useWallet } from '@solana/wallet-adapter-react'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import Tooltip from './Tooltip'
import MenuItem from './MenuItem'
import Footer from './Footer'

const Layout = ({ children }) => {
  const { t } = useTranslation(['common', 'delegate'])
  const { connected, publicKey } = useWallet()
  const { mangoAccount, initialLoad } = useMangoAccount()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { width } = useViewport()
  const isMobile = width ? width < breakpoints.sm : false
  const router = useRouter()
  const { pathname } = router
  const { pubkey } = router.query

  const canWithdraw =
    mangoAccount?.owner && publicKey
      ? mangoAccount?.owner?.equals(publicKey)
      : false

  useEffect(() => {
    const collapsed = width ? width <= breakpoints.xl : false
    setIsCollapsed(collapsed)
  }, [])

  const handleCloseAccounts = useCallback(() => {
    setShowAccountsModal(false)
  }, [])


  return (
    <div className={`flex-grow bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <div className="flex">
        {isMobile ? (
          <div className="fixed bottom-0 left-0 z-20 w-full md:hidden">
          </div>
        ) : (
          <div className={isCollapsed ? 'mr[64px]' : 'mr-[220px]'}>
            <div className={`fixed z-20 h-screen`}>
                
              </div>
            </div>
        )}
        <div className="w-full overflow-hidden">
          <GlobalNotification />
          <div className="flex h-16 items-center justify-between border-b border-th-bkg-1 solapenav px-6">
              <img
                    className={`absolute w-auto h-9`}
                    src="/assets/solape.svg"
                    alt="next"
                  />
            <div
                className={`hidden md:ml-40 md:flex md:items-center md:space-x-2 lg:space-x-3`}
              >
                <MenuItem href={"/"}>
                  <span style={{ color: 'rgb(255, 230, 204)' }}>Swap</span>
                </MenuItem>
                <MenuItem href="https://dex.solape.io/#/market">
                  Trade
                </MenuItem>
                <MenuItem href="https://dex.solape.io/#/markets">Markets</MenuItem>
                <MenuItem href="https://dex.solape.io/#/about">About</MenuItem>
                <MenuItem href="https://dex.solape.io/#/help">Help</MenuItem>
              </div>
            <div className="flex items-center space-x-4">
              {!isMobile && connected && !initialLoad ? (
                <div className="flex space-x-2">
                </div>
              ) : null}
              <IconButton
                className="h-8 w-8 flex ml-44"
                onClick={() => setShowSettingsModal(true)}
              >
                <CogIcon className="h-5 w-5 flex" />
              </IconButton>
              <ConnectWalletButton />
            </div>
          </div>
          {pathname === '/' ? <FavoritesShortcutBar /> : null}
          <div className={pathname === '/' ? 'px-3' : 'px-6 pb-16 md:pb-6'}>
            {children}
          </div>
        </div>
      </div>
      {showAccountsModal && (
        <AccountsModal
          onClose={handleCloseAccounts}
          isOpen={showAccountsModal}
        />
      )}
      {showSettingsModal ? (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          isOpen={showSettingsModal}
        />
      ) : null}
    </div>
  
  )
}

export default Layout
