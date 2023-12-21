import { GetNonce, gameReveal } from "@/api/game";
import { GetProfile } from "@/api/profile";
import { GetLeaderboards } from "@/api/leaderboard";
import { updateState } from '@/api/verify';
import { GetrecentFlickers } from "@/api/recent-flickers";
import GetCookie from "@/hooks/cookies/getCookie";
import SetCookie from "@/hooks/cookies/setCookie";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FC, useEffect, useState, useRef } from "react";
import AddFundModal from "../add-fund-modal/addFundModal";
import { getLeatherSignature } from "../play-modal/leather";
import { signMessage } from "../play-modal/unisat";
import { getXverseSign } from "../play-modal/xverse";
import RecentFlickersModal from "../recent-flickers-modal/recentFlickersModal";
import RecentFlickersTable from "../recent-flickers-table/recentFlickerTable";
import {
  calculateTimeAgo,
} from '../../utils'
import {

  playButtonAudio,
  playLeverDownAudio,
  playLeverUpAudio,
} from "@/sound";
import flipingSideLongAudio from '../../../public/static/audio/fliping_side_long.mp3';
import Confetti from "react-confetti";
import { verifyData } from "@/api/verify";
import { useBalanceStore } from "../../store";
import UsernameModal from "../username-modal/usernameModal";
import DepositModal from "../exchange-modal/exchangeModal";
import { time } from "console";
import { hash160 } from "bitcoinjs-lib/src/crypto";
import BadgeModal from "../badge-modal/badge-modal";
import BadgesModal from "../badges-modal/BadgesModal";
import Image from "next/image";
import crtBg from "../../../public/static/img/border.png"


interface FlipCoinContentProps { }

interface dataProps {
  outcome: string;
  public_key: string;
  bet_amount: string;
  timeAgo: string;
  verified: boolean;
}

const FlipCoinContent: FC<FlipCoinContentProps> = ({ }) => {
  const audioRef = useRef();
  const startVideoRef = useRef<HTMLVideoElement>(null);
  const dropVideoRef = useRef<HTMLVideoElement>(null);
  const winVideoRef = useRef<HTMLVideoElement>(null);
  const loseVideoRef = useRef<HTMLVideoElement>(null);
  const [winAnimationVideo, setWinAnimationVideo] = useState("");
  const [loseAnimationVideo, setLoseAnimationVideo] = useState("");
  const [isWinAnimation, setIsWinAnimation] = useState(false);
  const [isLoseAnimation, setIsLoseAnimation] = useState(false);

  const audioSecondRef = useRef();
  const [count, setCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [canShow, setCanShow] = useState(false);
  const [data, setData] = useState<dataProps[]>([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [verification, setVerification] = useState(false);
  const [isDropPlaying, setIsDropPlaying] = useState(false);
  const [isVerificationDisplaying, setIsVerificationDisplaying] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [gameResult, setGameResult] = useState(0);
  const [acd, setAcd] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("ended"); // 3 status, started, loading, ended
  const [balance, setBalance] = useState(0);
  const [earning, setEarning] = useState(0);
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState("heads");
  const [start, setStart] = useState(false);
  const [first, setFirst] = useState(true);
  const [idx, setIdx] = useState(0);
  const [loadingAnimation, setLoadingAnimation] = useState("coin_start.gif");
  const [startAnimation, setStartAnimation] = useState("coin_start.gif");
  const [recentData, setRecentData] = useState([]);
  const updateBalance = useBalanceStore((state) => state.updateBalance);
  const [badgesWon, setbadgesWon] = useState([]);
  const [showBadgesModal, setshowBadgesModal] = useState(false);


  const { data: _recentData, isLoading, isRefetching } = useQuery({
    queryKey: ["recent"],
    queryFn: GetrecentFlickers,
  });

  useEffect(() => {
    const ws = new WebSocket('wss://flickthebean.onrender.com');

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'subscribe', topic: 'updates' }));


    }

    ws.onmessage = async function (event) {
      if (event.data == "ping") return;
      const message = JSON.parse(event.data);

      if (message.hasOwnProperty('recentTuggerz')) {
        // @ts-ignore
        setRecentData((preRecentData) => {
          let tempData = [
            {
              ...message.recentTuggerz,
              new: true,
            },
            ...preRecentData];
          return tempData;
        });

        setTimeout(() => {
          // @ts-ignore
          setRecentData((preRecentData) => {
            let tempData = preRecentData.map(item => (
              {
                // @ts-ignore
                ...item,
                new: false,
              })
            );
            return tempData;
          });
        }, 1000)
      }

    }

    ws.onclose = function (event) {


    };

    ws.onerror = function (event) {
      console.error('WebSocket error:', event);
    };

    return () => {

    }
  }, [])



  useEffect(() => {
    if (_recentData != undefined) {
      setRecentData(_recentData);
    }
  }, [isLoading]);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setStartAnimation("coin flip.mp4");
      }, 100);
    }

    const currentBalance = GetCookie("balance");
    if (currentBalance != "") {
      setBalance(
        Math.round((parseFloat(currentBalance) + Number.EPSILON) * 100) / 100
      );
    }

    if (loading) {
      // @ts-ignore
      audioRef.current.play();
      setTimeout(() => {
        // @ts-ignore
        audioSecondRef.current.play();
      }, 1000)
    } else {
      // @ts-ignore
      audioRef.current.pause();
      // @ts-ignore
      audioSecondRef.current.pause();
    }
  }, [loading]);

  useEffect(() => {
    updateBalance(balance);
  }, [balance]);

  useEffect(() => {
    if (earning) {
      setTimeout(() => {
        setPoints(points + earning)
        setEarning(0);
      }, 2000);
    }
  }, [earning]);

  useEffect(() => {
    // if (window.innerWidth <= 1280) {
    //   const div = document.getElementsByClassName('btns-control')[0]
    //   div.scrollIntoView({behavior: 'smooth'});
    // }

    const intervalId = setInterval(async () => {
      setIdx((beforeIdx) => {
        return (beforeIdx + 1) % 3;
      });
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const profileData = await GetProfile();
      if (profileData.status == 200) setPoints(profileData.data.data.points);
    })();
  }, []);




  useEffect(function () {
    if (!loading && gameResult == 1 && isWinAnimation) {
      if (winVideoRef.current) {
        winVideoRef.current.play();
        setTimeout(() => setCanShow(true), 2000)
      }
    }

    if (!loading && gameResult == 2 && isLoseAnimation) {
      if (loseVideoRef.current) {
        loseVideoRef.current.play();
        setTimeout(() => setCanShow(true), 2000)
      }
    }

  }, [loading, gameResult, isWinAnimation, isLoseAnimation])

  useEffect(function () {

    if (loading && loadingAnimation == "coin start.mp4") {
      if (startVideoRef.current) {
        // startVideoRef.current.currentTime = .01
        startVideoRef.current.play();
      }
    }

    if (loading && loadingAnimation == "coin drop.mp4") {
      // debugger
      if (dropVideoRef.current) {
        dropVideoRef.current.currentTime = .2
        dropVideoRef.current.play();
        setIsDropPlaying(true)
      }
    }

  }, [loading, loadingAnimation]);


  const handleVerification = async () => {
    const _commitment = JSON.parse(GetCookie('commitment'));
    const _selection = JSON.parse(GetCookie('selection'));
    const _reveal = JSON.parse(GetCookie('reveal'));
    const userId = Number(GetCookie('userId'));

    const result = await verifyData(_commitment, _selection, _reveal);
    if (result == true) {
      await updateState(userId, _commitment.gameNonce, result);
      setGameResult(0)
    }
  };

  const handleAddFundModal = () => {
    setShowAddFundModal(!showAddFundModal);
  };

  const handleUsernameModal = () => {
    setShowUsernameModal(!showUsernameModal);
  };

  const handleDepositModal = () => {
    setShowDepositModal(!showDepositModal);
  };

  const handleRecentModal = () => {
    playButtonAudio();
    setShowRecentModal(!showRecentModal);
  };

  const handleAcd = (val: number) => {
    setIsVerificationDisplaying(false);
    setAcd(val);
    setVerification(false);
    setGameResult(0);
  };

  const startGame = async (choice: boolean) => {
    setbadgesWon([]);
    setStart(true);
    setGameResult(0);
    setLoading(true);
    setLoadingStatus("started");
    setLoadingAnimation("coin start.mp4");
    let { commitment, gameNonce } = await GetNonce();
    // SetCookie("commitment", commitment);
    SetCookie("gameNonce", gameNonce);
    const wallet = GetCookie("wallet");
    const winAnimations = ["among_us", "batman", "beach", "boombox", "chainsaw_man", "dance", "disco_ball", "dunk", "gigachad", "hadouken", "harry_potter", "karate_kid", "koopa", "lambo", "luffy", "mr_t", "nyancat", "one_punch", "over_9000", "pepe", "pickle_rick", "robocop", "rocket", "saiyan", "sommersault", "sonic", "spiderman"];
    const lostAnimations = ["among_us", "butt_kick", "cannon", "car", "chicken", "dickbutt", "duck_hunt", "dunk", "explode", "harry_potter", "headshot", "lightning", "mario_flower", "mario_shell", "pokeball", "punch", "rocket", "saiyan", "sommersault", "sonic", "soyjack", "spiderman"];

    const winRandom =
      winAnimations[Math.floor(Math.random() * winAnimations.length)];
    const lostRandom =
      lostAnimations[Math.floor(Math.random() * lostAnimations.length)];

    setWinAnimationVideo(`win_${winRandom}`);
    setLoseAnimationVideo(`lose_${lostRandom}`);


    if (wallet == "xverse") {
      const { publicKey, signature } = await getXverseSign(gameNonce);

      playLeverUpAudio();
      if (publicKey != "" && signature != "") {
        const { gameResponse, newBalance, userPoints } = await gameReveal(
          gameNonce,
          choice,
          acd,
          publicKey,
          signature
        );

        if (userPoints?.achievements?.length) {
          setbadgesWon(userPoints?.achievements)
        }

        setLoadingAnimation("coin drop.mp4");
        setLoadingStatus("ended");

        if (gameResponse != undefined && newBalance != "0.00") {

          if (gameResponse) {
            setIsWinAnimation(true);
          }
          else {
            setIsLoseAnimation(true);
          }

          if (gameResponse) {
            let winCount = Number(!!GetCookie('winCount') ? GetCookie('winCount') : 0);
            winCount += 1;
            setStreak(winCount);
            // @ts-ignore
            SetCookie('winCount', winCount);
            setCount(1000);
            setTimeout(() => {
              setCount(0)
            }, 1000);
          } else {
            // @ts-ignore
            SetCookie('winCount', 0);
          }
          setVerification(true)
          // setBalance(Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100);

          setGameResult(gameResponse ? 1 : 2);
          setBalance(
            Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100
          );
          if (userPoints) {
            const { pointsEarned } = userPoints;
            setEarning(pointsEarned);
          }
          SetCookie("balance", newBalance);
        } else {

          setGameResult(0);
          enqueueSnackbar("Balance too low", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      } else {
        setLoading(false);
      }
    } else if (wallet == "unisat") {
      const { publicKey, signature } = await signMessage(gameNonce);
      playLeverUpAudio();
      if (publicKey != "" && signature != "") {
        const { gameResponse, newBalance, userPoints } = await gameReveal(
          gameNonce,
          choice,
          acd,
          publicKey,
          signature
        );

        if (userPoints?.achievements?.length) {
          setbadgesWon(userPoints?.achievements)
        }
        setLoadingAnimation("coin drop.mp4");
        setLoadingStatus("ended");
        if (gameResponse != undefined && newBalance != "0.00") {

          if (gameResponse) {
            setIsWinAnimation(true);
          }
          else {
            setIsLoseAnimation(true);
          }

          setBalance(Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100);
          if (gameResponse) {
            setCount(1000);
            let winCount = Number(!!GetCookie('winCount') ? GetCookie('winCount') : 0);
            winCount += 1;
            setStreak(winCount);
            // @ts-ignore
            SetCookie('winCount', winCount);
            setTimeout(() => {
              setCount(0)
            }, 1000);
          } else {
            // @ts-ignore
            SetCookie('winCount', 0);
          }
          setVerification(true)

          setGameResult(gameResponse ? 1 : 2);
          if (userPoints) {
            const { pointsEarned } = userPoints;
            setEarning(pointsEarned);
          }
          setBalance(
            Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100
          );
          SetCookie("balance", newBalance);
        } else {
          setLoading(false);
          setGameResult(0);
          enqueueSnackbar("Balance too low", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      } else {
        setLoading(false);
      }
    } else if (wallet == "leather") {
      const { publicKey, signature } = await getLeatherSignature(gameNonce);
      if (publicKey != "" && signature != "") {
        const { gameResponse, newBalance, userPoints } = await gameReveal(
          gameNonce,
          choice,
          acd,
          publicKey,
          signature
        );

        if (userPoints?.achievements?.length) {
          setbadgesWon(userPoints?.achievements)
        }
        setLoadingAnimation("coin drop.mp4");
        setLoadingStatus("ended");
        if (gameResponse != undefined && newBalance != "0.00") {
          if (gameResponse) {
            setIsWinAnimation(true);
          }
          else {
            setIsLoseAnimation(true);
          }

          if (gameResponse) {
            let winCount = Number(!!GetCookie('winCount') ? GetCookie('winCount') : 0);
            winCount += 1;
            setStreak(winCount);
            // @ts-ignore
            SetCookie('winCount', winCount);
            setCount(1000);
            setTimeout(() => {
              setCount(0)
            }, 1000);
          } else {
            // @ts-ignore
            SetCookie('winCount', 0);
          }
          setVerification(true)
          setGameResult(gameResponse ? 1 : 2);
          if (userPoints) {
            const { pointsEarned } = userPoints;
            setEarning(pointsEarned);
          }
          setBalance(
            Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100
          );
          SetCookie("balance", newBalance);
        } else {
          setLoading(false);
          setGameResult(0);
          enqueueSnackbar("Balance too low", {
            variant: "error",
            anchorOrigin: { horizontal: "left", vertical: "top" },
          });
        }
      } else {
        setLoading(false);
      }
    }
    setCanShow(false);
    playLeverUpAudio();
    setStart(false);
  };

  return (
    <>
      <BadgesModal handleModal={() => { setbadgesWon([]); setshowBadgesModal(false) }} show={badgesWon.length > 0 && showBadgesModal} badges={badgesWon} />
      <div>
        {
          // @ts-ignore
          <audio src="/static/audio/fliping_side_long.mp3" ref={audioRef} loop />
        }
        {
          // @ts-ignore
          <audio src="/static/audio/fliping_side_long.mp3" ref={audioSecondRef} loop />
        }
      </div>
      <section className="btns-wrapper">
        <div className="result h-100">
          <div className='crt'></div>
          {
            !(!loading && gameResult == 0 && isVerificationDisplaying) && <div className="xp-points">
              <span>{"0000000".substring(0, 7 - points.toString().length)}</span>{points}
              <span style={{ color: '#f3bf00', verticalAlign: 'super', fontSize: '57%' }}>XP</span>
              <div className={earning != 0 ? 'ani' : ''}>+{earning}</div>
            </div>
          }
          {
            gameResult == 1 && canShow && (
              streak >= 2 && <div className="streak">streak:{streak}</div>
            )
          }
          {(!loading && gameResult == 0 && isVerificationDisplaying) && (
            <video
              className="verification-video"
              preload="metadata"
              autoPlay
              style={{ marginTop: '0px' }}
              onEnded={() => {
                setVerification(!verification)
                setIsVerificationDisplaying(false);
              }}
              src={`/static/videos/verification.mov`}
              playsInline
            />
          )}
          <div className="loading_videos-wrapper">
            {
              <video
                ref={startVideoRef}
                style={{
                  display: loading && loadingAnimation == "coin start.mp4" ? 'block' : 'none'
                }}
                // preload="metadata"
                width=""
                height="auto"
                className="main-video coin_video"
                onEnded={() => {
                  if (loadingStatus == "started") {
                    setLoadingStatus('loading');
                    setLoadingAnimation("coin flip.mp4");
                    setTimeout(function () {
                      if (startVideoRef.current) {
                        startVideoRef.current.currentTime = 0
                      }
                    }, 1000)
                  }
                }}
                src={`/static/animations/coin start.mp4`}
                playsInline
              />
            }

            {
              <video
                style={{
                  display: loading && loadingAnimation == "coin flip.mp4" ? 'block' : 'none'
                }}
                src={`/static/animations/coin flip.mp4`}
                width=""
                height="auto"
                className="main-video coin_video"
                autoPlay
                loop={true}
                muted
                playsInline
              />
            }

            {
              <video
                ref={dropVideoRef}
                style={{
                  display: loading && isDropPlaying && loadingAnimation == "coin drop.mp4" ? 'block' : 'none'
                }}
                // preload="metadata"
                width=""
                height="auto"
                className="main-video coin_video"
                onEnded={() => {
                  if (loadingStatus == "ended") {
                    setLoading(false);
                    setIsDropPlaying(false);
                    setTimeout(function () {
                      if (dropVideoRef.current) {
                        dropVideoRef.current.currentTime = 0
                      }
                    }, 1000)
                  }
                }}
                src={`/static/animations/coin drop.mp4`}
                playsInline
              />
            }

            <div style={{
              display: !loading && gameResult == 1 && isWinAnimation ? "block" : "none"
            }}>
              {winAnimationVideo && <video
                ref={winVideoRef}
                preload="metadata"
                width=""
                height="auto"
                onEnded={() => {

                  if (!loading) {
                    setTimeout(function () {
                      setshowBadgesModal(true)
                    }, 0)
                  }
                }}

                className="main-video video_if_win"
                src={`/static/animations/${winAnimationVideo}.mp4`}
                playsInline
              />}
              {
                canShow && (<div className="result__desc">
                  <h2 className="result__title">{status.toUpperCase()}</h2>
                  <div className="result__subtitle text-success">+{acd} ΛRC</div>
                </div>)
              }
            </div>

            <div style={{
              display: !loading && gameResult == 2 && isLoseAnimation ? "block" : "none"
            }}>
              {loseAnimationVideo && <video
                ref={loseVideoRef}
                preload="metadata"
                width=""
                height="auto"
                className="main-video video_if_lose"
                onEnded={() => {

                  if (!loading) {
                    setTimeout(function () {
                      setshowBadgesModal(true)
                    }, 0)
                  }
                }}
                src={`/static/animations/${loseAnimationVideo}.mp4`}
                playsInline
              />}
              {
                canShow && (<div className="result__desc">
                  <h2 className="result__title">
                    {(status === "heads" ? "tails" : "heads").toUpperCase()}
                  </h2>
                  <div className="result__subtitle text-alert">-{acd} ΛRC</div>
                </div>)
              }
            </div>

            <video style={{
              display: (!loading && gameResult == 0 && !isVerificationDisplaying) ? 'block' : "none"
            }}
              preload="metadata"
              width=""
              height="auto"
              className="main-video"
              autoPlay={true}
              loop
              muted
              src={`/static/animations/flip Y.mp4`}
              playsInline
            />
          </div>

          <Image className='srt__bg-image' src={crtBg} priority alt="border" width={600}
            height={450} quality={60} />
        </div>

        <div className="btns-inner-wrapper">
          <div className="btns-control">
            <div className="btns-control-left">
              <button
                className={`btns-verification ${!loading && !first && verification && "btns-verification-active"} ${isVerificationDisplaying ? "verification-clicked" : " "}`}
                onClick={() => {
                  verification && handleVerification();
                  verification && setIsVerificationDisplaying(true);
                }}
              >
                <div className="btns-verification-icon">
                  <img
                    style={{
                      display: !loading && !first && verification ? "block" : "none"
                    }}
                    src="/static/img/tick_active.png"
                  />

                  <img
                    style={{
                      display: !loading && !first && verification ? "none" : "block"
                    }}
                    src="/static/img/tick_inactive.png" />
                </div>
                <span>VERIFY</span>
              </button>
              <div className="btns-row">
                <button
                  className={`btns-row-item ${status == "heads" ? "btns-row-item-active" : ""
                    }`}
                  id="head-btn"
                  disabled={loading}
                  onClick={() => {
                    setStatus("heads");
                    playButtonAudio();
                    setGameResult(0);
                    setVerification(false);
                    setIsVerificationDisplaying(false);
                  }}
                >
                  <img
                    className="btn-white__avatar"
                    src="/static/img/heads_active.webp"
                    alt="head icon"
                    style={{
                      display: status == "heads" ? "block" : "none"
                    }}

                  />
                  <img
                    className="btn-white__avatar"
                    src="/static/img/heads_disable.webp"
                    alt="head icon"
                    style={{
                      display: status !== "heads" ? "block" : "none"
                    }}

                  />
                </button>
                <button
                  className={`btns-row-item ${status == "tails" ? "btns-row-item-active" : ""
                    }`}
                  disabled={loading}
                  onClick={() => {
                    setStatus("tails");
                    playButtonAudio();
                    setGameResult(0);
                    setVerification(false);
                    setIsVerificationDisplaying(false);
                  }}
                >
                  <img
                    className="btn-white__avatar"
                    src="/static/img/tails_active.webp"
                    alt="tail icon"
                    style={{
                      display: status == "tails" ? "block" : "none"
                    }}
                  />
                  <img
                    className="btn-white__avatar"
                    src="/static/img/tails_disable.webp"
                    alt="tail icon"
                    style={{
                      display: status !== "tails" ? "block" : "none"
                    }}
                  />
                </button>
              </div>
              <div className="btns-grid">
                <button
                  disabled={loading}
                  className={`btn-outline btn-outline--medium ${acd == 1 && "btn-outline--medium-active"
                    }`}
                  onClick={() => {
                    playButtonAudio();
                    handleAcd(1);
                  }}
                >
                  <span>1 ΛRC</span>
                </button>
                <button
                  disabled={loading}
                  className={`btn-outline btn-outline--medium ${acd == 5 && "btn-outline--medium-active"
                    }`}
                  onClick={() => {
                    playButtonAudio();
                    handleAcd(5);
                  }}
                >
                  <span>5 ΛRC</span>
                </button>
                <button
                  disabled={loading}
                  className={`btn-outline btn-outline--medium ${acd == 10 && "btn-outline--medium-active"
                    }`}
                  onClick={() => {
                    playButtonAudio();
                    handleAcd(10);
                  }}
                >
                  <span>10 ΛRC</span>
                </button>
              </div>
            </div>
            <div className="btns-control-right">
              <div
                className={`switch ${start ? "active" : ""}`}
                onClick={() => {
                  if (start)
                    return;
                  playLeverDownAudio();
                  setFirst(false);
                  setVerification(false)
                  setIsVerificationDisplaying(false);
                  if (status == "heads") {
                    startGame(true);
                  }

                  if (status == "tails") {
                    startGame(false);
                  }
                }}
              >
                <img
                  className="switch-fix"
                  src="/static/img/switch_fix.webp"
                  alt="switch"
                />
                <img
                  className="switch-node"
                  src="/static/img/switch_node.webp"
                  alt="switch"
                />
                <Image
                  className="switch-ball"
                  src="/static/img/switch_ball.webp"
                  alt="switch"
                  width={100}
                  height={100}
                />
              </div>
              <img src={`/static/img/arrow_1.png`} alt="switch" style={{ display: idx == 0 ? "block" : "none" }} />
              <img src={`/static/img/arrow_2.png`} alt="switch" style={{ display: idx == 1 ? "block" : "none" }} />
              <img src={`/static/img/arrow_3.png`} alt="switch" style={{ display: idx == 2 ? "block" : "none" }} />
            </div>
          </div>
          <div className="btns-other">
            <div className="btns-history">
              <ul className={`primary-list`}>
                <li className="primary-list__header" style={{ alignItems: 'center' }}>
                  <div className="primary-list__header__col">RECENT TUGGERZ</div>
                  <div
                    className="primary-list__header__col-2"
                    onClick={() => {
                      handleRecentModal();
                    }}
                  >SEE ALL</div>
                </li>
                <li>
                  <ul style={{ overflow: 'auto' }} className="main-ul">
                    {
                      // @ts-ignore
                      recentData ? recentData.map((item, index) => (<li className={`primary-list__item ${item?.new ? 'new-row' : ''}`} key={index}>
                        <div className="primary-list__col-2"><span className="primary-list__col">{
                          // @ts-ignore
                          item?.user_name != '' ? item.user_name : item?.public_key.slice(0, 4) + "..." + item?.public_key.slice(-4)
                        }</span> just flipped <span>{// @ts-ignore
                          Math.round((parseFloat(item.bet_amount) + Number.EPSILON) * 100) / 100} ΛRC</span> and <span style={{ color: item.outcome == 'lost' ? '#EF4343' : '#5BEF43' }}>{item.outcome}</span></div>
                        <div className="time-ago">
                          {// @ts-ignore
                            calculateTimeAgo(item.timeAgo)
                          }

                          <img src={`/static/svgs/check_${// @ts-ignore
                            item.verified ? 'active' : 'inactive'}.svg`} />
                        </div>
                      </li>
                      )) : <p style={{ textAlign: 'center', marginTop: 50 }}>Loading Data</p>
                    }
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <RecentFlickersModal
          show={showRecentModal}
          handleModal={handleRecentModal}
          tableData={recentData}
        />
        <AddFundModal
          show={showAddFundModal}
          handleModal={handleAddFundModal}
        />
      </section>
    </>
  );
};

export default FlipCoinContent;
