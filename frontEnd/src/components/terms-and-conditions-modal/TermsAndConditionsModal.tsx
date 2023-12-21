import { FC } from "react";
import Modal from "../modal/modal";


interface TermsAndConditionsModal {
    show: boolean;
    handleModal: () => void;
}

const TermsAndConditionsModal: FC<TermsAndConditionsModal> = ({ show, handleModal }) => {
    return (
        <Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
            <div className="faq">
                <div className="close">
                    <img src="/static/svgs/close.svg" onClick={handleModal} />
                </div>
                <div className="faq-title text-yellow title">
                    ARCAD3 Terms and Conditions for "Tugg the Nuggz" and Related Services
                </div>
                <br />
                <p>Last Updated: 05 December 2023</p>
                <div className="content">
                    <div className="item">
                        <div className="text-yellow">
                            1. Introduction
                        </div>
                        <div className="text-white">
                            These Terms and Conditions ("Terms") govern your use of the ARCAD3 website ("Website"), the game "Tugg the Nuggz" ("Game"), and related services, including any mobile applications and services offered through www.arcd3.com (collectively referred to as the "Service"). By using the Service, you agree to these Terms. If you do not agree, do not use the Service.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            2. Acceptance and Amendment of Terms

                        </div>
                        <div className="text-white">
                            Your use of the Service constitutes acceptance of these Terms. We may modify these Terms at any time; modifications become effective upon posting on the Website. Continued use after changes indicates your acceptance of the amended Terms.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            3. User Obligations
                        </div>
                        <div className="text-white">
                            By using the Service, you affirm that: <br />
                            - You are at least 18 years old or the legal age for gambling in your jurisdiction. <br />
                            - You have the legal capacity to enter this agreement. <br />
                            - Gambling is legal in your jurisdiction, and you are not accessing the Service from a prohibited country. <br />
                            - You will not use location masking technology (e.g., VPNs). <br />
                            - The payment method used is in your custody and legitimate. <br />
                            - You understand the risk of losing money and are not using the Service for commercial purposes or on behalf of another.


                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            4. Restricted Use
                        </div>
                        <div className="text-white">
                            Do not use the Service if: <br />
                            - You are under 18 or below the legal gambling age in your jurisdiction. <br />
                            - You reside in a country where online gambling is illegal. <br />
                            - For fraudulent, illegal, or unauthorised activities.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            5. Account Registration and Management
                        </div>
                        <div className="text-white">
                            - Provide accurate information during registration and keep it updated. <br />
                            - Only one account is allowed per user. Duplicate accounts will be closed. <br />
                            - You are responsible for the confidentiality of your account details.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            6. Deposits and Withdrawals
                        </div>
                        <div className="text-white">
                            - Funds must be deposited using BTC and ARC token. <br />
                            - ARCAD3 is not responsible for any third-party transaction fees. <br />
                            - Withdrawals are subject to our verification procedures.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            7. Turns and Gameplay
                        </div>
                        <div className="text-white">
                            - Turns are final and non-refundable. <br />
                            - Minimum and maximum limits apply. <br />
                            - ARCAD3 is not responsible for user errors or gameplay malfunctions.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            8. Compliance and Legal Obligations
                        </div>
                        <div className="text-white">
                            - You must comply with all applicable laws and regulations. <br />
                            - ARCAD3 adheres to anti-money laundering policies and practices. <br />
                            - You agree to undergo any necessary identity, credit, and source of funds/wealth verification checks as required.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            9. Intellectual Property
                        </div>
                        <div className="text-white">
                            - All content and software on the Service are owned by ARCAD3 or its licensors. <br />
                            - Unauthorised use of ARCAD3's intellectual property is prohibited.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            10. Limitation of Liability

                        </div>
                        <div className="text-white">
                            - ARCAD3's liability is limited to the amount $1. <br />
                            - We are not liable for issues beyond our reasonable control, including system errors or communication failures.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            11. Dispute Resolution
                        </div>
                        <div className="text-white">
                            - Disputes should be reported to customer service within 3 days of occurrence. <br />
                            - ARCAD3 will attempt to resolve disputes amicably.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            12. Governing Law
                        </div>
                        <div className="text-white">
                            - These Terms are governed by the laws of the United Kingdom.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            13. General Provisions
                        </div>
                        <div className="text-white">
                            - These Terms constitute the entire agreement between you and ARCAD3. <br />
                            - Any waiver of these Terms must be in writing.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            14. Responsible Gambling
                        </div>
                        <div className="text-white">
                            - ARCAD3 provides tools for self-exclusion and setting financial limits. <br />
                            - You acknowledge the possibility of losing money and accept responsibility for such losses.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            15. Protection of Customer Funds
                        </div>
                        <div className="text-white">
                            - Your Account is not a bank account and is not insured or guaranteed. <br />
                            - Funds are held separate from company funds but are not protected in the event of insolvency.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            16. Account Use and Security

                        </div>
                        <div className="text-white">
                            - You are responsible for maintaining the security of your account. <br />
                            - Any unauthorised use or disclosure of your login details is your responsibility. <br />
                            - Report any suspected breach of account security immediately.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            17. Prohibited Jurisdictions
                        </div>
                        <div className="text-white">
                            - The Service cannot be used in jurisdictions where online gambling is illegal. <br />
                            - Attempts to bypass geographical restrictions will result in account closure.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            18. Changes to the Terms & Conditions
                        </div>
                        <div className="text-white">
                            - ARCAD3 reserves the right to change these Terms & Conditions. <br />
                            - Continued use of the Service after changes signifies acceptance of the new Terms.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            19. Complaints and Dispute Resolution
                        </div>
                        <div className="text-white">
                            - For complaints, contact our Customer Service team in our Discord server (<a className="text-white" href="https://discord.gg/arcad3" target="_blank">https://discord.gg/arcad3</a>)
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default TermsAndConditionsModal;