import { FC } from "react";
import Modal from "../modal/modal";


interface PrivacyPolicyModal {
    show: boolean;
    handleModal: () => void;
}

const PrivacyPolicyModal: FC<PrivacyPolicyModal> = ({ show, handleModal }) => {
    return (
        <Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
            <div className="faq">
                <div className="close">
                    <img src="/static/svgs/close.svg" onClick={handleModal} />
                </div>
                <div className="faq-title text-yellow title">
                    ARCAD3 Privacy Policy
                </div><br />
                <p>Effective Date: 05th December 2023</p>
                <div className="content">
                    <div className="item">
                        <div className="text-yellow">
                            Overview
                        </div>
                        <div className="text-white">
                            This Privacy Policy outlines how ARCAD3 (referred to as "we", "us", or "our") manages your personal data. We may update this policy, and changes will be posted on this page along with the effective date.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Data Collection
                        </div>
                        <div className="text-white">
                            We collect personal data necessary for providing our services. This includes, but is not limited to, your Bitcoin address. We also track your gaming activities for payouts and monitor responsible gaming.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Data Security
                        </div>
                        <div className="text-white">
                            Your data's security is paramount. We implement robust measures to safeguard your personal data
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Use of Personal Data
                        </div>
                        <div className="text-white">
                            Your data helps us manage your account, process transactions, comply with legal obligations, and ensure responsible gaming. We also use data for customer support and service improvements.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Cookies and Tracking
                        </div>
                        <div className="text-white">
                            We use cookies and similar technologies for website functionality, personalisation, and security. You can manage your cookie preferences through our website.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Third-Party Data Sharing
                        </div>
                        <div className="text-white">
                            We may share data with trusted third parties for service provision, legal compliance, fraud prevention, and identity verification.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Marketing Preferences
                        </div>
                        <div className="text-white">
                            You control how we use your data for marketing. You can opt-out at any time by contacting us.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Data Transfers
                        </div>
                        <div className="text-white">
                            Your data may be transferred outside the EEA but will always be protected.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Your Rights
                        </div>
                        <div className="text-white">
                            You have rights regarding your data, including access, correction, and deletion. Contact us to exercise these rights.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Contact Us
                        </div>
                        <div className="text-white">
                            For any privacy-related queries or to exercise your rights, contact our Customer Services team in the Discord server (<a href="https://discord.gg/arcad3" target="_blank" className="text-white">https://discord.gg/arcad3</a>)
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Updates to Your Data
                        </div>
                        <div className="text-white">
                            You can update or delete your personal data anytime via customer service team.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Data Retention
                        </div>
                        <div className="text-white">
                            We retain your data as long as necessary for service provision and legal compliance.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Security Measures
                        </div>
                        <div className="text-white">
                            We use advanced security measures to protect your data, including encryption and secure environments.
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default PrivacyPolicyModal;