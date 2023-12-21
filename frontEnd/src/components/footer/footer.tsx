"use client";

import { useGlobalContext } from "@/app/react-query-provider/reactQueryProvider";
import GetCookie from "@/hooks/cookies/getCookie";
import { usePathname } from "next/navigation";
import { FC, useState, useEffect } from "react";
import UnlockRewards from "../unlock-rewards/unlockRewards";
import FAQModal from '../faq-modal/FAQModal';
import PrivacyPolicyModal from "../privacy-polocy-modal/Privacy-policy-modal";
import TermsAndConditionsModal from "../terms-and-conditions-modal/TermsAndConditionsModal";
import ResponsibleGamingModal from "../responsible-gaming-modal/ResponsibleGamingModal";
import KYCModal from "../kycModal/KYCModal";
import AMLModal from "../amlModal/AMLModal";

interface FooterProps {
}

const Footer: FC<FooterProps> = () => {
  const router = usePathname();
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsAndConditionsModal, setHandleTermsAndConditionsModal] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showAMLModal, setShowAMLModal] = useState(false);
  const { isLoggedin, setIsLoggedIn } = useGlobalContext();
  const handleFaqModal = () => {
    setShowFaqModal(!showFaqModal);
  }
  const handlePrivacyModal = () => {
    setShowPrivacyModal(!showPrivacyModal);
  }
  const handleTermsAndConditionsModal = () => {
    setHandleTermsAndConditionsModal(!showTermsAndConditionsModal);
  }
  const handleResponsibleGamingModal = () => {
    setShowResponsibleModal(!showResponsibleModal);
  }
  const handleKYCModal = () => {
    setShowKYCModal(!showKYCModal);
  }
  const handleAMLModal = () => {
    setShowAMLModal(!showAMLModal);
  }

  return (
    <footer className="footer">
      {/* { isLoggedin && <UnlockRewards /> } */}
      {/* <h3 className="footer__heading">
      3% fees apply for every flip. Refer to <a href="#" className="footer__heading-number">FAQ</a> for more information.
    </h3> */}
      <FAQModal show={showFaqModal} handleModal={handleFaqModal} />
      <PrivacyPolicyModal show={showPrivacyModal} handleModal={handlePrivacyModal} />
      <TermsAndConditionsModal show={showTermsAndConditionsModal} handleModal={handleTermsAndConditionsModal} />
      <ResponsibleGamingModal show={showResponsibleModal} handleModal={handleResponsibleGamingModal} />
      <KYCModal show={showKYCModal} handleModal={handleKYCModal} />
      <AMLModal show={showAMLModal} handleModal={handleAMLModal} />
      <div className="footer__subheading">
        <div className="footer__content">
          <div className="footer__row">
            <a role="button" rel="noopener noreferrer" onClick={handleFaqModal} className="footer-faq">FAQ</a>
            <a role="button" rel="noopener noreferrer" onClick={handlePrivacyModal} className="footer-faq">Privacy Policy</a>
            <a role="button" rel="noopener noreferrer" onClick={handleTermsAndConditionsModal} className="footer-faq">T&C</a>
            <a role="button" rel="noopener noreferrer" onClick={handleResponsibleGamingModal} className="footer-faq">Responsible Gaming</a>
            <a role="button" rel="noopener noreferrer" onClick={handleKYCModal} className="footer-faq">KYC</a>
            <a role="button" rel="noopener noreferrer" onClick={handleAMLModal} className="footer-faq">AML</a>
          </div>
          <p>
            Game powered by Ordinal <a href="https://ordinals.com/inscription/74c221cc1cb7fef53220075d2c14fc9d7ab29d8b11e38db3dd5dd7b95bac515di0" target="_blank" rel="noopener noreferrer">#36822068</a>
          </p>
          <div className="footer__copyright">
            <span>All rights reserved to ARCAD3&trade;	</span>
          </div>
        </div>

      </div>

    </footer>
  )
}

export default Footer;