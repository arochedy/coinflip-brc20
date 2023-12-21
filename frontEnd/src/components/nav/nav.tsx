"use client"

import { useGlobalContext } from '@/app/react-query-provider/reactQueryProvider';
import GetCookie from '@/hooks/cookies/getCookie';
import { GetProfile } from "@/api/profile";
import RemoveCookie from '@/hooks/cookies/removeCookie';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from "react";
import { GetLeaderboards } from '@/api/leaderboard';
// import FAQModal from '../faq-modal/FAQModal';
// import RankModal from '../rank-modal/RankModal';
// import PrizeModal from '../prize-modal/PrizeModal';
// import MobileMenu from '../mobile-menu/MobileMenu';
// import ProfileModal from '../profile-modal/profileModal';
import DepositModal from "../deposit-modal/depositModal";
import {
  useBalanceStore,
} from '../../store'
import ws from '../../socket';
import { playButtonAudio } from '@/sound';
import WithdrawlModal from '../withdrawl-model/WithdrawlModal';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const FAQModal = dynamic(() => import('../faq-modal/FAQModal'))
const RankModal = dynamic(() => import('../rank-modal/RankModal'))
const PrizeModal = dynamic(() => import('../prize-modal/PrizeModal'))
const MobileMenu = dynamic(() => import('../mobile-menu/MobileMenu'))
const ProfileModal = dynamic(() => import('../profile-modal/profileModal'))

interface NavbarProps {
}

const Navbar: FC<NavbarProps> = () => {
  const pathName = usePathname();
  const router = useRouter();
  const [openNav, setOpneNav] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawlModal, setShowWithdrawlModal] = useState(false);
  const [pubKey, setPubkey] = useState('');
  const [myAddress, setMyAddress] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const { isLoggedin, setIsLoggedIn } = useGlobalContext();
  let balance = useBalanceStore(state => state.balance);
  const updateBalance = useBalanceStore((state) => state.updateBalance);

  useEffect(() => {

    (async () => {
      const val = GetCookie('userId');
      if (val == '')
        return;
      const profileData = await GetProfile();
      if (profileData.status == 200) setMyAddress(profileData.data.data.publicKey);
    })();


  }, [isLoggedin]);

  useEffect(() => {
    const key = GetCookie('publicKey');
    setMyAddress(key);
    setPubkey(`${key.slice(0, 5)}....${key.slice(-8)}`);
  }, [pubKey])

  const handleNavbar = () => {
    setOpneNav(!openNav);
  }

  const handleRankModal = () => {
    setShowRankModal(!showRankModal);
  }

  const handleFaqModal = () => {
    setShowFaqModal(!showFaqModal);
  }

  const handlePrizeModal = () => {
    setShowPrizeModal(!showPrizeModal);
  }

  const handleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  }

  const handleProfileModal = async () => {
    playButtonAudio();
    setShowProfileModal(!showProfileModal);
  }

  const handleUsernameModal = () => {
    setShowUsernameModal(!showUsernameModal);
  }

  const handleDepositModal = () => {
    setShowDepositModal(!showDepositModal);
  }

  const handleWithdrawlModal = () => {
    setShowWithdrawlModal(!showWithdrawlModal);
  }

  const logout = () => {
    playButtonAudio();
    RemoveCookie('userId');
    RemoveCookie('sign');
    RemoveCookie('gameNonce');
    RemoveCookie('commitment');
    RemoveCookie('publicKey');
    RemoveCookie('wallet');
    RemoveCookie('balance');
    RemoveCookie('isLogin');
    setIsLoggedIn(false);
    router.push('/');
  }

  useEffect(() => {
    ws.onmessage = function (event) {
      if (event.data == 'ping') return
      const message = JSON.parse(event.data);
      if (message.hasOwnProperty('balance')) {

        const val = GetCookie('userId');
        if (message.balance.userId == val)
          updateBalance(message.balance.balance.balance);
      }

      if (message.hasOwnProperty('ranking')) {

        setLeaderboard(message.ranking.data);
      }
    }

    const isLogin = GetCookie("isLogin");
    setIsLoggedIn(!!isLogin ? true : false);
    // if(!isLogin) {
    //   router.push('/')
    // }
    (async () => {
      const leaderboardData = await GetLeaderboards();
      setLeaderboard(leaderboardData);
    })();
  }, [])

  return (
    <header className="header">
      <div className='header__logo'>
        <button className="flex-shrink-0 logo__image">
          <Image src="/static/img/logo.webp" alt="logo" fill sizes="" quality={80} priority rel="preload" />
        </button>

        <div className='header__logo_separator' style={{ display: isLoggedin ? "block" : "none" }}></div>
        <div className='header__logo_balance' style={{ display: isLoggedin ? "block" : "none" }}>
          {balance ? balance.toFixed(2) : "000.00"}
          <span className='header__logo_currency'>ΛRC</span>
        </div>
      </div>
      <div className="header__wrap">
        <div className="header__wrap">
          <>
            {isLoggedin &&

              <button className="btn-outline btn-deposit" onClick={() => { playButtonAudio(); handleWithdrawlModal() }}>
                <img src="/static/svgs/deposit.svg" />Withdraw</button>

            }
            {isLoggedin &&

              <button className="btn-outline btn-deposit" onClick={() => { playButtonAudio(); handleDepositModal() }}><img src="/static/svgs/deposit.svg" />Deposit</button>

            }
            <div className="header__profile">

              {isLoggedin && <button className="btn-outline gift" onClick={() => { playButtonAudio(); handlePrizeModal() }}>
                <img src="/static/svgs/gift.svg" alt="share icon" />
                <span />
              </button>}
              {isLoggedin && <button className="btn-outline" onClick={() => { playButtonAudio(); handleRankModal() }}>
                <img src="/static/svgs/rank.svg" alt="share icon" />
                <span />
              </button>}
              {isLoggedin &&
                <figure
                  className="btn-outline"
                  onClick={handleProfileModal}
                >
                  <img
                    className="header__profile-image"
                    src="/static/svgs/profile.svg"
                    alt="profile icon"
                    style={{
                      cursor: 'pointer'
                    }}
                  />
                </figure>}
              {/* <button className="btn-outline" onClick={() => {playButtonAudio();handleFaqModal()}}>
                  <img src="/static/svgs/qa.svg" alt="share icon" />
                </button> */}
              {/* <p className="header__profile-text">{pubKey}</p> */}
              {isLoggedin &&
                <><button className="btn-outline" onClick={logout}>
                  <img src="/static/svgs/exit.svg" alt="share icon" />
                </button>
                  <button className="btn-outline menu" onClick={handleMobileMenu}>
                    <img src="/static/svgs/menu.svg" alt="share icon" />
                  </button>
                </>}

            </div>
          </>
        </div>

        <nav className="header__nav">
          <ul className={`header__list  ${openNav ? 'open' : ''}`}>
          </ul>
        </nav>
      </div>
      <FAQModal show={showFaqModal} handleModal={handleFaqModal} />
      {isLoggedin && <PrizeModal show={showPrizeModal} handleModal={handlePrizeModal} />}
      {/* @ts-ignore */}
      {isLoggedin && <RankModal show={showRankModal} handleModal={handleRankModal} data={leaderboard} myAddress={myAddress} />}
      <MobileMenu
        show={showMobileMenu}
        handleModal={handleMobileMenu}
        isLoggedin={isLoggedin}
        handleFaqModal={handleFaqModal}
        playButtonAudio={playButtonAudio}
        handleDepositModal={handleDepositModal}
        handleProfileModal={handleProfileModal}
        handlePrizeModal={handlePrizeModal}
        handleRankModal={handleRankModal}
        logout={logout}
        handleWithdrawlModal={handleWithdrawlModal}
      />
      {isLoggedin && <ProfileModal show={showProfileModal} handleModal={handleProfileModal} />}
      {/* <UsernameModal show={showUsernameModal} handleModal={handleUsernameModal}/> */}
      <DepositModal show={showDepositModal} handleModal={handleDepositModal} />
      <WithdrawlModal show={showWithdrawlModal} handleModal={handleWithdrawlModal} />
    </header>
  )
}

export default Navbar;