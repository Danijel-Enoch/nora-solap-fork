import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { useJupiter, RouteInfo } from '@jup-ag/react-hook'
import { TOKEN_LIST_URL } from '@jup-ag/core'
import { PublicKey } from '@solana/web3.js'
import useMangoStore from '../stores/useMangoStore'
import { connectionSelector } from '../stores/selectors'
import sortBy from 'lodash/sortBy'
import sum from 'lodash/sum'
import {
  CogIcon,
  ExclamationCircleIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  SwitchVerticalIcon,
} from '@heroicons/react/outline'
import { ChevronDownIcon, SwitchHorizontalIcon } from '@heroicons/react/solid'
import { abbreviateAddress } from '../utils'
import SwapTokenSelect from './SwapTokenSelect'
import { notify } from '../utils/notifications'
import { Token } from '../@types/types'
import {
  getTokenAccountsByOwnerWithWrappedSol,
  nativeToUi,
  zeroKey,
} from '@blockworks-foundation/mango-client'
import Button, { IconButton, LinkButton } from './Button'
import { useViewport } from '../hooks/useViewport'
import { breakpoints } from './TradePageGrid'
import useLocalStorageState from '../hooks/useLocalStorageState'
import Modal from './Modal'
import { ElementTitle } from './styles'
import { RefreshClockwiseIcon, WalletIcon } from './icons'
import Tooltip from './Tooltip'
import SwapSettingsModal from './SwapSettingsModal'
import SwapTokenInfo from './SwapTokenInfo'
import { numberFormatter } from './SwapTokenInfo'
import { useTranslation } from 'next-i18next'
import Tabs from './Tabs'
import SwapTokenInsights from './SwapTokenInsights'
import { useWallet } from '@solana/wallet-adapter-react'
import { handleWalletConnect } from 'components/ConnectWalletButton'
import SolapeSwapStats from "../components/SolapeSwapStats";

const TABS = ['Market Data', 'Performance Insights']

type UseJupiterProps = Parameters<typeof useJupiter>[0]
type UseFormValue = Omit<UseJupiterProps, 'amount'> & {
  amount: null | number
}

const JupiterForm = ({ useSolapeStats = false }) => {
  const { t } = useTranslation(['common', 'swap'])
  const { wallet, publicKey, connected, signAllTransactions, signTransaction } =
    useWallet()
  const connection = useMangoStore(connectionSelector)
  const [showSettings, setShowSettings] = useState(false)
  const [depositAndFee, setDepositAndFee] = useState<any | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null)
  const [showInputTokenSelect, setShowInputTokenSelect] = useState(false)
  const [showOutputTokenSelect, setShowOutputTokenSelect] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])
  const [tokenPrices, setTokenPrices] = useState<any | null>(null)
  const [coinGeckoList, setCoinGeckoList] = useState<any[] | null>(null)
  const [walletTokens, setWalletTokens] = useState<any[]>([])
  const [slippage, setSlippage] = useState(0.5)
  const [formValue, setFormValue] = useState<UseFormValue>({
    amount: null,
    inputMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    outputMint: new PublicKey('GHvFFSZ9BctWsEc5nujR1MTmmJWY7tgQz2AXE6WVFtGN'),
    slippage,
  })
  const [hasSwapped, setHasSwapped] = useLocalStorageState('hasSwapped', false)
  const [showWalletDraw, setShowWalletDraw] = useState(false)
  const [walletTokenPrices, setWalletTokenPrices] = useState<any[] | null>(null)
  const { width } = useViewport()
  const isMobile = width ? width < breakpoints.sm : false
  const [feeValue, setFeeValue] = useState<number | null>(null)
  const [showRoutesModal, setShowRoutesModal] = useState(false)
  const [loadWalletTokens, setLoadWalletTokens] = useState(false)
  const [swapRate, setSwapRate] = useState(false)
  const [activeTab, setActiveTab] = useState('Market Data')

  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
  }

  const fetchWalletTokens = useCallback(async () => {
    if (!publicKey) {
      return
    }
    const ownedTokens: any[] = []
    const ownedTokenAccounts = await getTokenAccountsByOwnerWithWrappedSol(
      connection,
      publicKey
    )

    ownedTokenAccounts.forEach((account) => {
      const decimals = tokens.find(
        (t) => t?.address === account.mint.toString()
      )?.decimals

      const uiBalance = nativeToUi(account.amount, decimals || 6)
      ownedTokens.push({ account, uiBalance })
    })
    setWalletTokens(ownedTokens)
  }, [publicKey, connection, tokens])

  // @ts-ignore
  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokens.find(
        (item) => item?.address === formValue.inputMint?.toBase58() || ''
      ),
      tokens.find(
        (item) => item?.address === formValue.outputMint?.toBase58() || ''
      ),
    ]
  }, [
    formValue.inputMint?.toBase58(),
    formValue.outputMint?.toBase58(),
    tokens,
  ])

  useEffect(() => {
    if (width >= 1680) {
      setShowWalletDraw(true)
    }
  }, [])

  useEffect(() => {
    const fetchCoinGeckoList = async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/list'
      )
      const data = await response.json()
      setCoinGeckoList(data)
    }

    fetchCoinGeckoList()
  }, [])

  useEffect(() => {
    if (connected) {
      fetchWalletTokens()
    }
  }, [connected, fetchWalletTokens])

  useEffect(() => {
    if (!coinGeckoList?.length) return
    setTokenPrices(null)
    const fetchTokenPrices = async () => {
      const inputId = coinGeckoList.find((x) =>
        inputTokenInfos?.extensions?.coingeckoId
          ? x?.id === inputTokenInfos.extensions.coingeckoId
          : x?.symbol?.toLowerCase() === inputTokenInfo?.symbol?.toLowerCase()
      )?.id
      const outputId = coinGeckoList.find((x) =>
        outputTokenInfos?.extensions?.coingeckoId
          ? x?.id === outputTokenInfos.extensions.coingeckoId
          : x?.symbol?.toLowerCase() === outputTokenInfo?.symbol?.toLowerCase()
      )?.id

      if (inputId && outputId) {
        const results = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${inputId},${outputId}&vs_currencies=usd`
        )
        const json = await results.json()
        if (json[inputId]?.usd && json[outputId]?.usd) {
          setTokenPrices({
            inputTokenPrice: json[inputId].usd,
            outputTokenPrice: json[outputId].usd,
          })
        }
      }
    }

    if (inputTokenInfo && outputTokenInfo) {
      fetchTokenPrices()
    }
  }, [inputTokenInfo, outputTokenInfo, coinGeckoList])

  const amountInDecimal = useMemo(() => {
    if (typeof formValue?.amount === 'number') {
      return formValue.amount * 10 ** (inputTokenInfo?.decimals || 1)
    }
  }, [inputTokenInfo, formValue.amount])

  const { routeMap, routes, loading, exchange, error, refresh } =
    useJupiter({
      ...formValue,
      amount: amountInDecimal ? amountInDecimal : 0,
      slippage,
    })

  useEffect(() => {
    // Fetch token list from Jupiter API

    fetch(TOKEN_LIST_URL['mainnet-beta'])
      .then((response) => response.json())
      .then((result) => setTokens(result))
  }, [])

  useEffect(() => {
    if (routes) {
      setSelectedRoute(routes[0])
    }
  }, [routes])

  useEffect(() => {
    const getDepositAndFee = async () => {
      const fees = await selectedRoute?.getDepositAndFee()
      if (fees) {
        setDepositAndFee(fees)
      }
    }
    if (selectedRoute && connected) {
      getDepositAndFee()
    }
  }, [selectedRoute])

  const outputTokenMints: any[] = useMemo(() => {
    if (routeMap.size && formValue.inputMint) {
      const routeOptions = routeMap.get(formValue.inputMint.toString())

      const routeOptionTokens =
        routeOptions?.map((address) => {
          return tokens.find((t) => {
            return t?.address === address
          })
        }) ?? []

      return routeOptionTokens
    } else {
      return sortedTokenMints
    }
  }, [routeMap, tokens, formValue.inputMint])

  const handleConnect = useCallback(() => {
    if (wallet) {
      handleWalletConnect(wallet)
    }
  }, [wallet])

  const inputWalletBalance = () => {
    if (walletTokens.length) {
      const walletToken = walletTokens.filter((t) => {
        return t.account.mint.toString() === inputTokenInfo?.address
      })
      const largestTokenAccount = sortBy(walletToken, 'uiBalance').reverse()[0]
      return largestTokenAccount?.uiBalance || 0.0
    }

    return 0.0
  }

  const outputWalletBalance = () => {
    if (walletTokens.length) {
      const walletToken = walletTokens.filter((t) => {
        return t.account.mint.toString() === outputTokenInfo?.address
      })
      const largestTokenAccount = sortBy(walletToken, 'uiBalance').reverse()[0]
      return largestTokenAccount?.uiBalance || 0.0
    }
    return 0.0
  }

  const [walletTokensWithInfos] = useMemo(() => {
    const userTokens: any[] = []
    tokens.map((item) => {
      const found = walletTokens.find(
        (token) => token.account.mint.toBase58() === item?.address
      )
      if (found) {
        userTokens.push({ ...found, item })
      }
    })
    return [userTokens]
  }, [walletTokens, tokens])

  const getWalletTokenPrices = async () => {
    const ids = walletTokensWithInfos.map(
      (token) => token.item.extensions?.coingeckoId
    )
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.toString()}&vs_currencies=usd`
    )
    const data = await response.json()
    setWalletTokenPrices(data)
  }

  const refreshWallet = async () => {
    setLoadWalletTokens(true)
    await fetchWalletTokens()
    await getWalletTokenPrices()
    setLoadWalletTokens(false)
  }

  const getSwapFeeTokenValue = async () => {
    if (!selectedRoute) return
    const mints = selectedRoute.marketInfos.map((info) => info.lpFee.mint)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mints.toString()}&vs_currencies=usd`
    )
    const data = await response.json()

    const feeValue = selectedRoute.marketInfos.reduce((a, c) => {
      const feeToken = tokens.find((item) => item?.address === c.lpFee?.mint)
      // FIXME: Remove ts-ignore possibly move the logic out of a reduce
      // @ts-ignore
      const amount = c.lpFee?.amount / Math.pow(10, feeToken.decimals)
      if (data[c.lpFee?.mint]) {
        return a + data[c.lpFee?.mint].usd * amount
      }
      if (c.lpFee?.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
        return a + 1 * amount
      }
    }, 0)
    if (feeValue) {
      setFeeValue(feeValue)
    }
  }

  useEffect(() => {
    if (selectedRoute) {
      getSwapFeeTokenValue()
    }
  }, [selectedRoute])

  useEffect(() => {
    getWalletTokenPrices()
  }, [walletTokensWithInfos])

  const handleSelectRoute = (route) => {
    setShowRoutesModal(false)
    setSelectedRoute(route)
  }

  const handleSwitchMints = () => {
    setFormValue((val) => ({
      ...val,
      inputMint: formValue.outputMint,
      outputMint: formValue.inputMint,
    }))
  }

  const sortedTokenMints = sortBy(tokens, (token) => {
    return token?.symbol.toLowerCase()
  })

  const outAmountUi = selectedRoute
    ? selectedRoute.outAmount / 10 ** (outputTokenInfo?.decimals || 1)
    : null

  const swapDisabled = loading || !selectedRoute || routes?.length === 0

  const inputTokenInfos = inputTokenInfo ? (inputTokenInfo as any) : null
  const outputTokenInfos = outputTokenInfo ? (outputTokenInfo as any) : null

  return (
    <div className="grid grid-cols-12 lg:space-x-4">
      <div className="col-span-12 xl:col-span-10 xl:col-start-2 ">
        <div className="flex flex-col md:flex-row md:space-x-6 lg:flex-row lg:space-x-6 xl:flex-row xl:space-x-6">
          <div className="w-full md:w-1/2  lg:w-1/3">
            <div className="relative">
              {connected &&
              walletTokensWithInfos.length &&
              walletTokenPrices &&
              !isMobile ? (
                <div
                  className={`top-22 fixed right-0 z-30 flex w-80 transform overflow-hidden transition-all duration-700 ease-in-out ${
                    showWalletDraw ? 'translate-x-0' : 'mr-16 translate-x-full'
                  }`}
                >
                  <aside
                    className={`ml-16 w-64 rounded-l-md bg-th-bkg-3 pb-4 pt-6`}
                  >
                    <div className="thin-scroll max-h-[480px] overflow-auto">
                      <div className="flex items-center justify-between px-4 pb-2">
                        <div>
                          <div className="text-base font-bold text-th-fgd-1">
                            {t('wallet')}
                          </div>
                          {publicKey ? (
                            <a
                              className="flex items-center text-xs text-th-fgd-3 hover:text-th-fgd-2"
                              href={`https://explorer.solana.com/address/${publicKey}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {abbreviateAddress(publicKey)}
                              <ExternalLinkIcon className="ml-0.5 -mt-0.5 h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                        <IconButton onClick={() => refreshWallet()}>
                          <RefreshClockwiseIcon
                            className={`h-4 w-4 ${
                              loadWalletTokens && 'animate-spin'
                            }`}
                          />
                        </IconButton>
                      </div>
                      {walletTokensWithInfos
                        .sort((a, b) => {
                          const aId = a.item.extensions?.coingeckoId
                          const bId = b.item.extensions?.coingeckoId
                          return (
                            b.uiBalance * walletTokenPrices[bId]?.usd -
                            a.uiBalance * walletTokenPrices[aId]?.usd
                          )
                        })
                        .map((token) => {
                          const geckoId = token.item.extensions?.coingeckoId
                          return (
                            <div
                              className="default-transition flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-th-bkg-4"
                              key={geckoId}
                              onClick={() =>
                                setFormValue((val) => ({
                                  ...val,
                                  inputMint: new PublicKey(token?.item.address),
                                }))
                              }
                            >
                              <div className="flex items-center">
                                {token.item.logoURI ? (
                                  <img
                                    className="rounded-full"
                                    src={token.item.logoURI}
                                    width="24"
                                    height="24"
                                    alt={token.item.symbol}
                                  />
                                ) : null}
                                <div>
                                  <div className="ml-2 text-th-fgd-1">
                                    {token.item.symbol}
                                  </div>
                                  {walletTokenPrices ? (
                                    <div className="ml-2 text-xs text-th-fgd-4">
                                      {walletTokenPrices[geckoId]
                                        ? `$${walletTokenPrices[geckoId].usd}`
                                        : t('swap:unavailable')}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              <div>
                                <div className="text-right text-th-fgd-1">
                                  {token.uiBalance.toLocaleString(undefined, {
                                    maximumSignificantDigits: 6,
                                  })}
                                </div>
                                <div className="text-right text-xs text-th-fgd-4">
                                  {walletTokenPrices[geckoId]
                                    ? `$${(
                                        token.uiBalance *
                                        walletTokenPrices[geckoId].usd
                                      ).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })}`
                                    : '?'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </aside>
                  <button
                    className="absolute right-64 top-20 rounded-r-none bg-th-bkg-4 p-3 text-th-fgd-1 hover:text-th-primary"
                    onClick={() => setShowWalletDraw(!showWalletDraw)}
                  >
                    <WalletIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : null}

              <div className="rounded-t-lg border-2 border-x-0 border-t-0 border-black bg-th-bkg-3 p-2 pl-9 pb-3">
              <h1 className={`mt-3 mb-0.5 -ml-9 sm:ml-5 `}>
              {<svg width="304" height="24" viewBox="0 0 304 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.877 18.582C25.877 19.4844 25.7598 20.2988 25.5254 21.0254C25.3027 21.7402 25.0039 22.373 24.6289 22.9238C24.2539 23.4746 23.8145 23.9434 23.3105 24.3301C22.8066 24.7168 22.2852 25.0332 21.7461 25.2793C21.207 25.5254 20.6562 25.707 20.0938 25.8242C19.543 25.9414 19.0215 26 18.5293 26H0.898438V21.4297H18.5293C19.4082 21.4297 20.0879 21.1719 20.5684 20.6562C21.0605 20.1406 21.3066 19.4492 21.3066 18.582C21.3066 18.1602 21.2422 17.7734 21.1133 17.4219C20.9844 17.0703 20.7969 16.7656 20.5508 16.5078C20.3164 16.25 20.0234 16.0508 19.6719 15.9102C19.332 15.7695 18.9512 15.6992 18.5293 15.6992H8.01758C7.2793 15.6992 6.48242 15.5703 5.62695 15.3125C4.77148 15.043 3.97461 14.6152 3.23633 14.0293C2.50977 13.4434 1.90039 12.6758 1.4082 11.7266C0.927734 10.7773 0.6875 9.61719 0.6875 8.24609C0.6875 6.875 0.927734 5.7207 1.4082 4.7832C1.90039 3.83398 2.50977 3.06641 3.23633 2.48047C3.97461 1.88281 4.77148 1.45508 5.62695 1.19727C6.48242 0.927734 7.2793 0.792969 8.01758 0.792969H23.5742V5.36328H8.01758C7.15039 5.36328 6.4707 5.62695 5.97852 6.1543C5.49805 6.68164 5.25781 7.37891 5.25781 8.24609C5.25781 9.125 5.49805 9.82227 5.97852 10.3379C6.4707 10.8418 7.15039 11.0938 8.01758 11.0938H18.5293H18.5645C19.0566 11.1055 19.5781 11.1758 20.1289 11.3047C20.6797 11.4219 21.2246 11.6094 21.7637 11.8672C22.3145 12.125 22.8359 12.4531 23.3281 12.8516C23.8203 13.2383 24.2539 13.707 24.6289 14.2578C25.0156 14.8086 25.3203 15.4414 25.543 16.1562C25.7656 16.8711 25.877 17.6797 25.877 18.582ZM56.1289 15.8047C56.1289 17.3398 55.8652 18.752 55.3379 20.041C54.8105 21.3301 54.0781 22.4434 53.1406 23.3809C52.2031 24.3184 51.0898 25.0508 49.8008 25.5781C48.5234 26.0938 47.1289 26.3516 45.6172 26.3516H39.4297C37.918 26.3516 36.5176 26.0938 35.2285 25.5781C33.9395 25.0508 32.8262 24.3184 31.8887 23.3809C30.9512 22.4434 30.2129 21.3301 29.6738 20.041C29.1465 18.752 28.8828 17.3398 28.8828 15.8047V10.9883C28.8828 9.46484 29.1465 8.05859 29.6738 6.76953C30.2129 5.46875 30.9512 4.35547 31.8887 3.42969C32.8262 2.49219 33.9395 1.75977 35.2285 1.23242C36.5176 0.705078 37.918 0.441406 39.4297 0.441406H45.6172C47.1289 0.441406 48.5234 0.705078 49.8008 1.23242C51.0898 1.75977 52.2031 2.49219 53.1406 3.42969C54.0781 4.35547 54.8105 5.46875 55.3379 6.76953C55.8652 8.05859 56.1289 9.46484 56.1289 10.9883V15.8047ZM51.5586 10.9883C51.5586 10.0859 51.4121 9.27148 51.1191 8.54492C50.8379 7.80664 50.4336 7.17969 49.9062 6.66406C49.3906 6.13672 48.7637 5.73242 48.0254 5.45117C47.2988 5.1582 46.4961 5.01172 45.6172 5.01172H39.4297C38.5391 5.01172 37.7246 5.1582 36.9863 5.45117C36.2598 5.73242 35.6328 6.13672 35.1055 6.66406C34.5781 7.17969 34.168 7.80664 33.875 8.54492C33.5938 9.27148 33.4531 10.0859 33.4531 10.9883V15.8047C33.4531 16.707 33.5938 17.5273 33.875 18.2656C34.168 18.9922 34.5781 19.6191 35.1055 20.1465C35.6328 20.6621 36.2598 21.0664 36.9863 21.3594C37.7246 21.6406 38.5391 21.7812 39.4297 21.7812H45.582C46.4727 21.7812 47.2812 21.6406 48.0078 21.3594C48.7461 21.0664 49.3789 20.6621 49.9062 20.1465C50.4336 19.6191 50.8379 18.9922 51.1191 18.2656C51.4121 17.5273 51.5586 16.707 51.5586 15.8047V10.9883ZM83.7969 26H62.9492C62.6211 26 62.3164 25.9414 62.0352 25.8242C61.7539 25.707 61.5078 25.5488 61.2969 25.3496C61.0977 25.1387 60.9395 24.8926 60.8223 24.6113C60.7051 24.3301 60.6465 24.0254 60.6465 23.6973V0.792969H65.2168V21.4297H83.7969V26ZM111.887 26H107.316V19.8125H91.25V26H86.6797V13.3965C86.6797 11.5566 86.9961 9.86328 87.6289 8.31641C88.2617 6.76953 89.1406 5.43945 90.2656 4.32617C91.3906 3.21289 92.7207 2.3457 94.2559 1.72461C95.791 1.10352 97.4668 0.792969 99.2832 0.792969H109.584C109.9 0.792969 110.199 0.851562 110.48 0.96875C110.762 1.08594 111.008 1.25 111.219 1.46094C111.43 1.67188 111.594 1.91797 111.711 2.19922C111.828 2.48047 111.887 2.7793 111.887 3.0957V26ZM91.25 15.2422H107.316V5.36328H99.2832C99.1426 5.36328 98.8438 5.38672 98.3867 5.43359C97.9414 5.46875 97.4199 5.56836 96.8223 5.73242C96.2363 5.89648 95.6152 6.14844 94.959 6.48828C94.3027 6.82812 93.6992 7.29688 93.1484 7.89453C92.5977 8.49219 92.1406 9.24219 91.7773 10.1445C91.4258 11.0352 91.25 12.1191 91.25 13.3965V15.2422ZM142.332 11.3398C142.332 12.3828 142.203 13.3145 141.945 14.1348C141.688 14.9551 141.336 15.6816 140.891 16.3145C140.457 16.9355 139.953 17.4688 139.379 17.9141C138.805 18.3594 138.201 18.7227 137.568 19.0039C136.947 19.2852 136.314 19.4902 135.67 19.6191C135.037 19.748 134.439 19.8125 133.877 19.8125H123.541V15.2422H133.877C134.463 15.1953 134.99 15.0781 135.459 14.8906C135.939 14.6914 136.35 14.4277 136.689 14.0996C137.029 13.7715 137.293 13.3789 137.48 12.9219C137.668 12.4531 137.762 11.9258 137.762 11.3398V9.26562C137.703 8.69141 137.58 8.16406 137.393 7.68359C137.205 7.20312 136.947 6.79297 136.619 6.45312C136.303 6.11328 135.916 5.84961 135.459 5.66211C135.002 5.46289 134.475 5.36328 133.877 5.36328H123.576C122.967 5.36328 122.504 5.52148 122.188 5.83789C121.871 6.1543 121.713 6.61133 121.713 7.20898V26H117.143V7.20898C117.143 6.03711 117.354 5.04102 117.775 4.2207C118.209 3.40039 118.742 2.73828 119.375 2.23438C120.02 1.73047 120.717 1.36719 121.467 1.14453C122.217 0.910156 122.908 0.792969 123.541 0.792969H133.877C134.908 0.792969 135.834 0.927734 136.654 1.19727C137.475 1.45508 138.195 1.80664 138.816 2.25195C139.449 2.68555 139.982 3.18945 140.416 3.76367C140.861 4.33789 141.225 4.94141 141.506 5.57422C141.799 6.19531 142.01 6.82812 142.139 7.47266C142.268 8.10547 142.332 8.70312 142.332 9.26562V11.3398ZM166.977 15.6992H152.545V11.0938H166.977V15.6992ZM169.033 26H152.545C151.912 26 151.221 25.8887 150.471 25.666C149.721 25.4434 149.023 25.0801 148.379 24.5762C147.746 24.0605 147.213 23.3984 146.779 22.5898C146.357 21.7695 146.146 20.7676 146.146 19.584V3.0957C146.146 2.7793 146.205 2.48047 146.322 2.19922C146.439 1.91797 146.598 1.67188 146.797 1.46094C147.008 1.25 147.254 1.08594 147.535 0.96875C147.816 0.851562 148.121 0.792969 148.449 0.792969H169.033V5.36328H150.717V19.584C150.717 20.1816 150.875 20.6387 151.191 20.9551C151.508 21.2715 151.971 21.4297 152.58 21.4297H169.033V26ZM209.393 18.582C209.393 19.4844 209.275 20.2988 209.041 21.0254C208.818 21.7402 208.52 22.373 208.145 22.9238C207.77 23.4746 207.33 23.9434 206.826 24.3301C206.322 24.7168 205.801 25.0332 205.262 25.2793C204.723 25.5254 204.172 25.707 203.609 25.8242C203.059 25.9414 202.537 26 202.045 26H184.414V21.4297H202.045C202.924 21.4297 203.604 21.1719 204.084 20.6562C204.576 20.1406 204.822 19.4492 204.822 18.582C204.822 18.1602 204.758 17.7734 204.629 17.4219C204.5 17.0703 204.312 16.7656 204.066 16.5078C203.832 16.25 203.539 16.0508 203.188 15.9102C202.848 15.7695 202.467 15.6992 202.045 15.6992H191.533C190.795 15.6992 189.998 15.5703 189.143 15.3125C188.287 15.043 187.49 14.6152 186.752 14.0293C186.025 13.4434 185.416 12.6758 184.924 11.7266C184.443 10.7773 184.203 9.61719 184.203 8.24609C184.203 6.875 184.443 5.7207 184.924 4.7832C185.416 3.83398 186.025 3.06641 186.752 2.48047C187.49 1.88281 188.287 1.45508 189.143 1.19727C189.998 0.927734 190.795 0.792969 191.533 0.792969H207.09V5.36328H191.533C190.666 5.36328 189.986 5.62695 189.494 6.1543C189.014 6.68164 188.773 7.37891 188.773 8.24609C188.773 9.125 189.014 9.82227 189.494 10.3379C189.986 10.8418 190.666 11.0938 191.533 11.0938H202.045H202.08C202.572 11.1055 203.094 11.1758 203.645 11.3047C204.195 11.4219 204.74 11.6094 205.279 11.8672C205.83 12.125 206.352 12.4531 206.844 12.8516C207.336 13.2383 207.77 13.707 208.145 14.2578C208.531 14.8086 208.836 15.4414 209.059 16.1562C209.281 16.8711 209.393 17.6797 209.393 18.582ZM245.129 0.792969L240.91 24.418C240.816 24.8867 240.605 25.291 240.277 25.6309C239.949 25.9707 239.551 26.1875 239.082 26.2812C238.602 26.3633 238.145 26.3105 237.711 26.123C237.289 25.9355 236.955 25.6426 236.709 25.2441L228.342 11.498L219.957 25.2441C219.758 25.584 219.482 25.8477 219.131 26.0352C218.791 26.2227 218.422 26.3164 218.023 26.3164C217.473 26.3164 216.986 26.1406 216.564 25.7891C216.143 25.4375 215.885 24.9805 215.791 24.418L211.537 0.792969H216.178L219.201 17.4395L226.408 5.94336C226.607 5.60352 226.877 5.33984 227.217 5.15234C227.568 4.96484 227.943 4.87109 228.342 4.87109C228.74 4.87109 229.109 4.96484 229.449 5.15234C229.789 5.33984 230.07 5.60352 230.293 5.94336L237.465 17.4395L240.488 0.792969H245.129ZM273.5 26H268.93V19.8125H252.863V26H248.293V13.3965C248.293 11.5566 248.609 9.86328 249.242 8.31641C249.875 6.76953 250.754 5.43945 251.879 4.32617C253.004 3.21289 254.334 2.3457 255.869 1.72461C257.404 1.10352 259.08 0.792969 260.896 0.792969H271.197C271.514 0.792969 271.812 0.851562 272.094 0.96875C272.375 1.08594 272.621 1.25 272.832 1.46094C273.043 1.67188 273.207 1.91797 273.324 2.19922C273.441 2.48047 273.5 2.7793 273.5 3.0957V26ZM252.863 15.2422H268.93V5.36328H260.896C260.756 5.36328 260.457 5.38672 260 5.43359C259.555 5.46875 259.033 5.56836 258.436 5.73242C257.85 5.89648 257.229 6.14844 256.572 6.48828C255.916 6.82812 255.312 7.29688 254.762 7.89453C254.211 8.49219 253.754 9.24219 253.391 10.1445C253.039 11.0352 252.863 12.1191 252.863 13.3965V15.2422ZM303.945 11.3398C303.945 12.3828 303.816 13.3145 303.559 14.1348C303.301 14.9551 302.949 15.6816 302.504 16.3145C302.07 16.9355 301.566 17.4688 300.992 17.9141C300.418 18.3594 299.814 18.7227 299.182 19.0039C298.561 19.2852 297.928 19.4902 297.283 19.6191C296.65 19.748 296.053 19.8125 295.49 19.8125H285.154V15.2422H295.49C296.076 15.1953 296.604 15.0781 297.072 14.8906C297.553 14.6914 297.963 14.4277 298.303 14.0996C298.643 13.7715 298.906 13.3789 299.094 12.9219C299.281 12.4531 299.375 11.9258 299.375 11.3398V9.26562C299.316 8.69141 299.193 8.16406 299.006 7.68359C298.818 7.20312 298.561 6.79297 298.232 6.45312C297.916 6.11328 297.529 5.84961 297.072 5.66211C296.615 5.46289 296.088 5.36328 295.49 5.36328H285.189C284.58 5.36328 284.117 5.52148 283.801 5.83789C283.484 6.1543 283.326 6.61133 283.326 7.20898V26H278.756V7.20898C278.756 6.03711 278.967 5.04102 279.389 4.2207C279.822 3.40039 280.355 2.73828 280.988 2.23438C281.633 1.73047 282.33 1.36719 283.08 1.14453C283.83 0.910156 284.521 0.792969 285.154 0.792969H295.49C296.521 0.792969 297.447 0.927734 298.268 1.19727C299.088 1.45508 299.809 1.80664 300.43 2.25195C301.062 2.68555 301.596 3.18945 302.029 3.76367C302.475 4.33789 302.838 4.94141 303.119 5.57422C303.412 6.19531 303.623 6.82812 303.752 7.47266C303.881 8.10547 303.945 8.70312 303.945 9.26562V11.3398Z" fill="white"/>
</svg>
}</h1>
              </div>
              <div className="rounded-none bg-th-bkg-3 p-6 pt-16">
              <div className="flex p-2 md:pl-12 mb-6 -mt-12 items-center">
            <InformationCircleIcon className="flex mb-4 mr-1 h-5 w-5 text-th-orange" />
            <p className="h-6 text-xs text-th-orange">{t('Instantly swap any Solana (SPL) token')}</p>
          </div>
                <div className="flex justify-between">
                  <label
                    htmlFor="inputMint"
                    className="block text-th-fgd-4 text-lg -ml-2 -mt-10 font-regular"
                  >
                    {t('swap:From')}
                  </label>
                  <div className="space-x-3 -mt-8 pr-1">
                    <label htmlFor="amount" className="text-md text-th-fgd-3">
                      {t('swap:bal')} {inputWalletBalance()}
                    </label>
                    {connected ? (
                      <>
                        <LinkButton
                          className="text-sm text-th-primary"
                          onClick={() => {
                            setFormValue((val) => ({
                              ...val,
                              amount: inputWalletBalance(),
                            }))
                          }}
                        >
                          {t('max')}
                        </LinkButton>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="mt-1 pb-8 -ml-1 grid grid-cols-2">
                  <div className="col-span-1">
                    <button
                      className="flex items-center hover:bg-th-bkg-3"
                      onClick={() => setShowInputTokenSelect(true)}
                    >
                        {inputTokenInfo?.logoURI ? (
                          <img
                            className="rounded-full"
                            src={inputTokenInfo?.logoURI}
                            width="48"
                            height="48"
                            alt={inputTokenInfo?.symbol}
                          />
                        ) : null}
                        <div className="ml-2 text-white text-sm md:text-2xl lg:text-2xl xl:text-2xl">
                          {inputTokenInfo?.symbol}
                        </div>
                        <ChevronDownIcon className="ml-0 h-4 w-4 md:h-8 md:w-8 xl:h-8 xl:w-8 flex-shrink-0 text-white" />
                      
                    </button>
                  </div>
                  <div className="col-span-1">
                <input
                  name="amount"
                  id="amount"
                  className="default-transition h-12 w-full rounded-md border border-th-bkg-3 bg-th-bkg-3 pr-1 text-right text-lg font-bold tracking-wide hover:border-th-fgd-4 focus:border-th-fgd-4 focus:outline-none"
                  value={formValue.amount || ''}
                  placeholder="0.00"
                  type="number"
                  pattern="[0-9]*"
                  onInput={(e: any) => {
                    let newValue = e.target?.value || 0
                    newValue = Number.isNaN(newValue) ? 0 : newValue

                    setFormValue((val) => ({
                      ...val,
                      amount: Number(newValue),
                    }))
                  }}
                />
              </div>
                </div>
                </div>
                <div className="rounded-b-lg bg-th-bkg-2 p-6">

                <div className="-my-14 pt-1 flex justify-left">
                  <button onClick={handleSwitchMints}>
                    <SwitchVerticalIcon className="default-transition h-16 w-16 rounded-full border-4 border-th-bkg-3 bg-th-bkg-2 p-2.5 -ml-3 text-th-fgd-1 hover:text-th-primary" />
                  </button>
                </div>

                <div className="flex items-center h-32 justify-between">
                  <label htmlFor="outputMint" className="block text-th-fgd-4 text-lg font-regular mt-6 -ml-2 ">
                    {t('swap:To')}
                  </label>
                  <span className="text-md pr-1 pt-3 -mt-18 text-th-fgd-3">
                    {t('swap:bal')} {outputWalletBalance()}
                  </span>
                </div>
                <div className="-mt-6 grid grid-cols-2">
                  <div className="col-span-1">
                    <button
                      className="flex -mt-1 items-center hover:bg-th-bkg-3"
                      onClick={() => setShowOutputTokenSelect(true)}
                    >
                      {outputTokenInfo?.logoURI ? (
                        <img
                          className="rounded-full"
                          src={outputTokenInfo?.logoURI}
                          width="48"
                          height="48"
                          alt={outputTokenInfo?.symbol}
                        />
                      ) : null}
                      <div className="ml-2 text-white text-sm md:text-2xl lg:text-2xl xl:text-2xl">
                        {outputTokenInfo?.symbol}
                      </div>
                      <ChevronDownIcon className="ml-0 h-4 w-4 md:h-8 md:w-8 xl:h-8 xl:w-8 flex-shrink-0 text-white" />
                    </button>
                  </div>
                  <div className="relative col-span-1">
                    <input
                      name="amount"
                      id="amount"
                      className="h-18 w-full cursor-not-allowed rounded-md border border-none bg-transparent pr-1 pt-1 text-right text-lg font-bold tracking-wide focus:outline-none"
                      disabled
                      placeholder="0.00"
                      value={
                        selectedRoute?.outAmount && formValue.amount
                          ? Intl.NumberFormat('en', {
                              minimumSignificantDigits: 1,
                              maximumSignificantDigits: 6,
                            }).format(
                              selectedRoute?.outAmount /
                                10 ** (outputTokenInfo?.decimals || 1)
                            )
                        : ''
                      }
                    />
                    {selectedRoute?.outAmount &&
                    formValue.amount &&
                    tokenPrices?.outputTokenPrice ? (
                      <div className="absolute right-0 mt-1 text-xs text-th-fgd-3">
                        ≈ $
                        {(
                          (selectedRoute?.outAmount /
                            10 ** (outputTokenInfo?.decimals || 1)) *
                          tokenPrices?.outputTokenPrice
                        ).toFixed(2)}
                      </div>
                    ) : null}
                  </div>
                </div>

                {routes?.length && selectedRoute ? (
                  <div className="mt-8 text-md text-th-fgd-3">
                    <div className="relative mb-4 rounded-md border border-th-bkg-4 px-3 pb-4 pt-4">
                      {selectedRoute === routes[0] ? (
                        <div className="absolute -top-2 rounded-sm bg-th-primary px-1 text-xs font-bold text-th-bkg-1">
                          {t('swap:best-swap')}
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="overflow-ellipsis whitespace-nowrap text-sm font-bold text-th-fgd-1">
                            {selectedRoute?.marketInfos.map((info, index) => {
                              let includeSeparator = false
                              if (
                                selectedRoute?.marketInfos.length > 1 &&
                                index !== selectedRoute?.marketInfos.length - 1
                              ) {
                                includeSeparator = true
                              }
                              return (
                                <span key={index}>{`${
                                  info.amm.label
                                } ${includeSeparator ? 'x ' : ''}`}</span>
                              )
                            })}
                          </span>
                          <div className="mr-2 mt-0.5 text-xs font-normal text-th-fgd-3">
                            {inputTokenInfo?.symbol} →{' '}
                            {selectedRoute?.marketInfos.map((r, index) => {
                              const showArrow =
                                index !== selectedRoute?.marketInfos.length - 1
                                  ? true
                                  : false
                              return (
                                <span key={index}>
                                  <span>
                                    {
                                      tokens.find(
                                        (item) =>
                                          item?.address ===
                                          r?.outputMint?.toString()
                                      )?.symbol
                                    }
                                  </span>
                                  {showArrow ? ' → ' : ''}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        <Button
                          className="rounded-md border border-th-fgd-4 bg-transparent px-2 pb-1 pt-1 text-center text-xs font-normal text-th-bkg-1"
                          disabled={routes?.length === 1}
                          onClick={() => setShowRoutesModal(true)}
                        >
                          {t('swap:routes-found', {
                            numberOfRoutes: routes?.length,
                          })}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-0 px-3">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-bold text-th-fgd-1">
                          {t('swap:swap-details')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <IconButton onClick={() => refresh()}>
                            <RefreshClockwiseIcon
                              className={`h-4 w-4 ${
                                loading ? 'animate-spin' : ''
                              }`}
                            />
                          </IconButton>
                          <IconButton onClick={() => setShowSettings(true)}>
                            <CogIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </div>
                      {outAmountUi && formValue?.amount ? (
                        <div className="flex justify-between text-xxs">
                          <span>{t('swap:rate')}</span>
                          <div>
                            <div className="flex items-center justify-end">
                              <div className="text-right text-xxs text-th-fgd-1">
                                {swapRate ? (
                                  <>
                                    1 {inputTokenInfo?.symbol} ≈{' '}
                                    {numberFormatter.format(
                                      outAmountUi / formValue?.amount
                                    )}{' '}
                                    {outputTokenInfo?.symbol}
                                  </>
                                ) : (
                                  <>
                                    1 {outputTokenInfo?.symbol} ≈{' '}
                                    {numberFormatter.format(
                                      formValue?.amount / outAmountUi
                                    )}{' '}
                                    {inputTokenInfo?.symbol}
                                  </>
                                )}
                              </div>
                              <SwitchHorizontalIcon
                                className="default-transition ml-1 h-4 w-4 cursor-pointer text-th-fgd-3 hover:text-th-fgd-2"
                                onClick={() => setSwapRate(!swapRate)}
                              />
                            </div> 
                          </div>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-xxs">
                        <span>{t('swap:price-impact')}</span>
                        <div className="text-right text-xxs text-th-fgd-1">
                          {selectedRoute?.priceImpactPct * 100 < 0.1
                            ? '< 0.1%'
                            : `~ ${(
                                selectedRoute?.priceImpactPct * 100
                              ).toFixed(4)}%`}
                        </div>
                      </div>
                      <div className="flex justify-between text-xxs">
                        <span>{t('swap:minimum-received')}</span>
                        {outputTokenInfo?.decimals ? (
                          <div className="text-right text-th-fgd-1 text-xxs">
                            {numberFormatter.format(
                              selectedRoute?.outAmountWithSlippage /
                                10 ** outputTokenInfo.decimals || 1
                            )}{' '}
                            {outputTokenInfo?.symbol}
                          </div>
                        ) : null}
                      </div>
                      {typeof feeValue === 'number' ? (
                        <div className="flex justify-between text-xxs">
                          <span>{t('swap:swap-fee')}</span>
                          <div className="flex items-center">
                            <div className="text-right text-th-fgd-1 text-xxs">
                              ≈ ${feeValue?.toFixed(2)}
                            </div>
                            <Tooltip
                              content={
                                <div className="space-y-2.5">
                                  {selectedRoute?.marketInfos.map(
                                    (info, index) => {
                                      const feeToken = tokens.find(
                                        (item) =>
                                          item?.address === info.lpFee?.mint
                                      )
                                      return (
                                        <div key={index}>
                                          <span>
                                            {t('swap:fees-paid-to', {
                                              feeRecipient:
                                                info?.amm?.label,
                                            })}
                                          </span>
                                          {feeToken?.decimals && (
                                            <div className="text-th-fgd-1">
                                              {(
                                                info.lpFee?.amount /
                                                Math.pow(10, feeToken?.decimals)
                                              ).toFixed(6)}{' '}
                                              {feeToken?.symbol} (
                                              {info.lpFee?.pct * 100}
                                              %)
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                  )}
                                </div>
                              }
                              placement={'left'}
                            >
                              <InformationCircleIcon className="ml-1.5 h-3.5 w-3.5 cursor-help text-th-primary" />
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        selectedRoute?.marketInfos.map((info, index) => {
                          const feeToken = tokens.find(
                            (item) => item?.address === info.lpFee?.mint
                          )
                          return (
                            <div className="flex justify-between" key={index}>
                              <span>
                                {t('swap:fees-paid-to', {
                                  feeRecipient: info?.amm?.label,
                                })}
                              </span>
                              {feeToken?.decimals && (
                                <div className="text-right text-th-fgd-1">
                                  {(
                                    info.lpFee?.amount /
                                    Math.pow(10, feeToken.decimals)
                                  ).toFixed(6)}{' '}
                                  {feeToken?.symbol} ({info.lpFee?.pct * 100}%)
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                      {connected ? (
                        <>
                          <div className="flex justify-between text-xxs">
                            <span>{t('swap:transaction-fee')}</span>
                            <div className="text-right text-th-fgd-1">
                              {depositAndFee
                                ? depositAndFee?.signatureFee / Math.pow(10, 9)
                                : '-'}{' '}
                              SOL
                            </div>
                          </div>
                          {depositAndFee?.ataDepositLength ||
                          depositAndFee?.openOrdersDeposits?.length ? (
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <span>{t('deposit')}</span>
                                <Tooltip
                                  content={
                                    <>
                                      {depositAndFee?.ataDepositLength ? (
                                        <div>{t('need-ata-account')}</div>
                                      ) : null}
                                      {depositAndFee?.openOrdersDeposits
                                        ?.length ? (
                                        <div className="mt-2">
                                          {t('swap:serum-requires-openorders')}{' '}
                                          <a
                                            href="https://docs.google.com/document/d/1qEWc_Bmc1aAxyCUcilKB4ZYpOu3B0BxIbe__dRYmVns/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {t('swap:heres-how')}
                                          </a>
                                        </div>
                                      ) : null}
                                    </>
                                  }
                                  placement={'left'}
                                >
                                  <InformationCircleIcon className="ml-1.5 h-3.5 w-3.5 cursor-help text-th-primary" />
                                </Tooltip>
                              </div>
                              <div>
                                {depositAndFee?.ataDepositLength ? (
                                  <div className="text-right text-th-fgd-1">
                                    {depositAndFee?.ataDepositLength === 1
                                      ? t('swap:ata-deposit-details', {
                                          cost: (
                                            depositAndFee?.ataDeposit /
                                            Math.pow(10, 9)
                                          ).toFixed(5),
                                          count:
                                            depositAndFee?.ataDepositLength,
                                        })
                                      : t('swap:ata-deposit-details_plural', {
                                          cost: (
                                            depositAndFee?.ataDeposit /
                                            Math.pow(10, 9)
                                          ).toFixed(5),
                                          count:
                                            depositAndFee?.ataDepositLength,
                                        })}
                                  </div>
                                ) : null}
                                {depositAndFee?.openOrdersDeposits?.length ? (
                                  <div className="text-right text-th-fgd-1">
                                    {depositAndFee?.openOrdersDeposits.length >
                                    1
                                      ? t('swap:serum-details_plural', {
                                          cost: (
                                            sum(
                                              depositAndFee?.openOrdersDeposits
                                            ) / Math.pow(10, 9)
                                          ).toFixed(5),
                                          count:
                                            depositAndFee?.openOrdersDeposits
                                              .length,
                                        })
                                      : t('swap:serum-details', {
                                          cost: (
                                            sum(
                                              depositAndFee?.openOrdersDeposits
                                            ) / Math.pow(10, 9)
                                          ).toFixed(5),
                                          count:
                                            depositAndFee?.openOrdersDeposits
                                              .length,
                                        })}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {error && (
                  <div className="mt-2 flex items-center justify-center text-th-red">
                    <ExclamationCircleIcon className="mr-1.5 h-5 w-5" />
                    {t('swap:jupiter-error')}
                  </div>
                )}
            <Button
              disabled={connected && swapDisabled}
              onClick={async () => {
                if (!connected && zeroKey !== publicKey) {
                  handleConnect()
                } else if (
                  !loading &&
                  selectedRoute &&
                  connected &&
                  wallet &&
                  signAllTransactions &&
                  signTransaction
                ) {
                  setSwapping(true)
                  let txCount = 1
                  let errorTxid
                  const swapResult = await exchange({
                    wallet: {
                      sendTransaction: wallet?.adapter?.sendTransaction,
                      publicKey: wallet?.adapter?.publicKey,
                      signAllTransactions,
                      signTransaction,
                    },
                    routeInfo: selectedRoute,
                    onTransaction: async (txid, totalTxs) => {
                      console.log('txid, totalTxs', txid, totalTxs)
                      if (txCount === totalTxs) {
                        errorTxid = txid
                        notify({
                          type: 'confirm',
                          title: 'Confirming Transaction',
                          txid,
                        })
                      }
                      await connection.confirmTransaction(txid, 'confirmed')

                      txCount++
                      return await connection.getTransaction(txid, {
                        commitment: 'confirmed',
                      })
                    },
                  })
                      console.log('swapResult', swapResult)

                      setSwapping(false)
                      fetchWalletTokens()
                      if ('error' in swapResult) {
                        console.log('Error:', swapResult.error)
                        notify({
                          type: 'error',
                          title: swapResult?.error?.name
                            ? swapResult.error.name
                            : '',
                          description: swapResult?.error?.message,
                          txid: errorTxid,
                        })
                      } else if ('txid' in swapResult) {
                        const description =
                          swapResult?.inputAmount && swapResult.outputAmount
                            ? `Swapped ${
                                swapResult.inputAmount /
                                10 ** (inputTokenInfo?.decimals || 1)
                              } ${inputTokenInfo?.symbol} to ${
                                swapResult.outputAmount /
                                10 ** (outputTokenInfo?.decimals || 1)
                              } ${outputTokenInfo?.symbol}`
                            : ''
                        notify({
                          type: 'success',
                          title: 'Swap Successful',
                          description,
                          txid: swapResult.txid,
                        })
                        setFormValue((val) => ({
                          ...val,
                          amount: null,
                        }))
                      }
                    }
                  }}
                  className="mt-6 h-12 w-full text-base rounded-md"
                >
                  {connected
                    ? swapping
                      ? t('swap:swapping')
                      : t('swap')
                    : t('connect-wallet')}
                </Button>
              </div>

              {showRoutesModal ? (
                <Modal
                  isOpen={showRoutesModal}
                  onClose={() => setShowRoutesModal(false)}
                >
                  <div className="mb-4 text-center text-lg font-bold text-th-fgd-1">
                    {t('swap:routes-found', {
                      numberOfRoutes: routes?.length,
                    })}
                  </div>
                  <div className="thin-scroll max-h-96 overflow-y-auto overflow-x-hidden pr-1">
                    {routes?.map((route, index) => {
                      const selected = selectedRoute === route
                      return (
                        <div
                          key={index}
                          className={`default-transition mb-2 rounded border bg-th-bkg-3 hover:bg-th-bkg-4 ${
                            selected
                              ? 'border-th-primary text-th-primary hover:border-th-primary'
                              : 'border-transparent text-th-fgd-1'
                          }`}
                        >
                          <button
                            className="w-full p-4"
                            onClick={() => handleSelectRoute(route)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col text-left">
                                <div className="overflow-ellipsis whitespace-nowrap">
                                  {route.marketInfos.map((info, index) => {
                                    let includeSeparator = false
                                    if (
                                      route.marketInfos.length > 1 &&
                                      index !== route.marketInfos.length - 1
                                    ) {
                                      includeSeparator = true
                                    }
                                    return (
                                      <span key={index}>{`${
                                        info.amm.label
                                      } ${includeSeparator ? 'x ' : ''}`}</span>
                                    )
                                  })}
                                </div>
                                <div className="text-xs font-normal text-th-fgd-4">
                                  {inputTokenInfo?.symbol} →{' '}
                                  {route.marketInfos.map((r, index) => {
                                    const showArrow =
                                      index !== route.marketInfos.length - 1
                                        ? true
                                        : false
                                    return (
                                      <span key={index}>
                                        <span>
                                          {
                                            tokens.find(
                                              (item) =>
                                                item?.address ===
                                                r?.outputMint?.toString()
                                            )?.symbol
                                          }
                                        </span>
                                        {showArrow ? ' → ' : ''}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="text-lg">
                                {numberFormatter.format(
                                  route.outAmount /
                                    10 ** (outputTokenInfo?.decimals || 1)
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </Modal>
              ) : null}
              {showInputTokenSelect ? (
                <SwapTokenSelect
                  isOpen={showInputTokenSelect}
                  onClose={() => setShowInputTokenSelect(false)}
                  sortedTokenMints={sortedTokenMints}
                  onTokenSelect={(token) => {
                    setShowInputTokenSelect(false)
                    setFormValue((val) => ({
                      ...val,
                      inputMint: new PublicKey(token?.address),
                    }))
                  }}
                />
              ) : null}
              {showOutputTokenSelect ? (
                <SwapTokenSelect
                  isOpen={showOutputTokenSelect}
                  onClose={() => setShowOutputTokenSelect(false)}
                  sortedTokenMints={outputTokenMints}
                  onTokenSelect={(token) => {
                    setShowOutputTokenSelect(false)
                    setFormValue((val) => ({
                      ...val,
                      outputMint: new PublicKey(token?.address),
                    }))
                  }}
                />
              ) : null}
              {showSettings ? (
                <SwapSettingsModal
                  isOpen={showSettings}
                  onClose={() => setShowSettings(false)}
                  slippage={slippage}
                  setSlippage={setSlippage}
                />
              ) : null}
              {connected && !hasSwapped ? (
                <Modal isOpen={!hasSwapped} onClose={() => setHasSwapped(true)}>
                  <ElementTitle>{t('swap:get-started')}</ElementTitle>
                  <div className="flex flex-col justify-center">
                    <div className="text-center text-th-fgd-3">
                      {t('swap-in-wallet')}
                    </div>
                  </div>
                </Modal>
              ) : null}
              {showInputTokenSelect ? (
                <SwapTokenSelect
                  isOpen={showInputTokenSelect}
                  onClose={() => setShowInputTokenSelect(false)}
                  sortedTokenMints={sortedTokenMints}
                  onTokenSelect={(token) => {
                    setShowInputTokenSelect(false)
                    setFormValue((val) => ({
                      ...val,
                      inputMint: new PublicKey(token?.address),
                    }))
                  }}
                />
              ) : null}
              {showOutputTokenSelect ? (
                <SwapTokenSelect
                  isOpen={showOutputTokenSelect}
                  onClose={() => setShowOutputTokenSelect(false)}
                  sortedTokenMints={outputTokenMints}
                  onTokenSelect={(token) => {
                    setShowOutputTokenSelect(false)
                    setFormValue((val) => ({
                      ...val,
                      outputMint: new PublicKey(token?.address),
                    }))
                  }}
                />
              ) : null}
            </div>
          </div>
          <div className="w-full py-52 sm:py-4 md:w-1/2 md:py-0 lg:w-2/3">
            {useSolapeStats ? (
              <SolapeSwapStats token={outputTokenInfos} />
            ) : (
              <>
                <Tabs
                  activeTab={activeTab}
                  onChange={handleTabChange}
                  tabs={TABS}
                />
                {inputTokenInfo &&
                outputTokenInfo &&
                activeTab === 'Market Data' ? (
                  <SwapTokenInfo
                    inputTokenId={inputTokenInfos?.extensions?.coingeckoId}
                    outputTokenId={outputTokenInfos?.extensions?.coingeckoId}
                  />
                ) : null}
                {activeTab === 'Performance Insights' ? (
                  <SwapTokenInsights
                    formState={formValue}
                    jupiterTokens={tokens}
                    setOutputToken={setFormValue}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JupiterForm