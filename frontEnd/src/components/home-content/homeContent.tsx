import { useGlobalContext } from '@/app/react-query-provider/reactQueryProvider';
import { GetrecentFlickers } from "@/api/recent-flickers";
import SetCookie from "@/hooks/cookies/setCookie";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import PlayModal from "../play-modal/playModal";
import RecentFlickersTable from "../recent-flickers-table/recentFlickerTable";
import RecentFlickersModal from "../recent-flickers-modal/recentFlickersModal";
import { playButtonAudio } from "@/sound";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import GetCookie from "@/hooks/cookies/getCookie";
import Image from 'next/image';
import crtBg from "../../../public/static/img/border.png"

const HomeContent: FC = () => {
  const router = useRouter();
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [start, setStart] = useState(false);
  const [count, setCount] = useState(0);
  const searchParams = useSearchParams();
  const search = searchParams.get("ref");
  const { isLoggedin, setIsLoggedIn } = useGlobalContext();
  const [recentData, setRecentData] = useState([]);

  const { data: _recentData, isLoading, isRefetching } = useQuery({
    queryKey: ["recent"],
    queryFn: GetrecentFlickers,
  });

  useEffect(() => {
    setRecentData(_recentData)
  }, [_recentData]);

  useEffect(() => {
    const ws = new WebSocket('wss://flickthebean.onrender.com');

    ws.onopen = () => {

      ws.send(JSON.stringify({ action: 'subscribe', topic: 'updates' }));
    }

    ws.onmessage = function (event) {
      const message = JSON.parse(event.data);

      if (message.hasOwnProperty('recentTuggerz')) {
        // @ts-ignore
        setRecentData((preRecentData) => {

          return ([message.recentTuggerz, ...preRecentData]);
        })
      }
    }

    ws.onclose = function (event) {

    };

    ws.onerror = function (event) {
      console.error('WebSocket error:', event);
    };
  }, [])

  useEffect(() => {
    const isLogin = GetCookie("isLogin");
    setIsLoggedIn(!!isLogin ? true : false);
    if (!!isLogin) {
      router.push('/flip-coin');
    }
  }, []);

  if (search != null) {
    SetCookie("refCode", search);
  }

  const handleModal = () => {
    setShowModal(!showModal);
  };
  return (
    <>
      <div className="home-content">
        <section className="left__play-area">

          <div className='result h-100'>
            <div className='crt'></div>
            <Image src="/static/img/landing.webp"
              quality={70}
              width={600}
              height={450}
              style={{ width: '90%', height: 'auto' }}
              alt="landing" />
            <Image className='srt__bg-image' src={crtBg} priority alt="border" width={600}
              height={450} quality={60} />
          </div>

        </section>
        <section className="center-area">
          <span>
            #1 place to <br /> tug the nug and <br /> coin flip
          </span>
          <div
            className="start_button"
            onClick={() => {
              playButtonAudio();
              handleModal();
              setCount(1000)
              setTimeout(() => {
                setCount(0);
              }, 1000)
            }}
          ></div>
          <RecentFlickersTable tableData={recentData} />
        </section>
      </div>
      <PlayModal show={showModal} handleModal={handleModal} />
    </>
  );
};

export default HomeContent;
