import { FC } from "react";
import Modal from "../modal/modal";


interface AMLModal {
    show: boolean;
    handleModal: () => void;
}

const AMLModal: FC<AMLModal> = ({ show, handleModal }) => {
    return (
        <Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
            <div className="faq">
                <div className="close">
                    <img src="/static/svgs/close.svg" onClick={handleModal} />
                </div>
                <div className="faq-title text-yellow title">
                    ARCAD3 Anti-Money Laundering (AML) Policy
                </div>
                <div className="content">
                    <div className="item">
                        <div className="text-yellow">
                            Introduction
                        </div>
                        <div className="text-white">
                            ARCAD3, prioritises the highest security standards for all transactions and activities on its platform. Our robust AML policy is integral to maintaining integrity and trust.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Objective
                        </div>
                        <div className="text-white">
                            The objective of ARCAD3's AML policy is to prevent and detect any instances of money laundering and financial crimes, ensuring a secure and compliant platform for all users.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Definition of Money Laundering

                        </div>
                        <div className="text-white">
                            Money laundering involves activities such as: <br />
                            - The conversion or transfer of illicit funds. <br />
                            - Concealment of the origin, nature, or location of these funds. <br />
                            - Acquisition or use of property, knowing it has criminal origins.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            AML Organization

                        </div>
                        <div className="text-white">
                            ARCAD3's full management team oversees the implementation and adherence to AML regulations and policies.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Policy Changes and Implementation

                        </div>
                        <div className="text-white">
                            Any significant changes to ARCAD3's AML policy require approval from general management.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Customer Identification (KYC)

                        </div>
                        <div className="text-white">
                            KYC is a critical element of our AML policy: <br />
                            - Formal identification using government-issued documents. <br />
                            - Verification of address through multiple electronic databases.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Risk Management

                        </div>
                        <div className="text-white">
                            To address varying risk levels globally, ARCAD3 categorises countries into different risk profiles and implements appropriate measures.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Ongoing Transaction Monitoring

                        </div>
                        <div className="text-white">
                            Continuous monitoring of transactions is conducted to identify and investigate any unusual or suspicious activities.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Reporting Suspicious Transactions

                        </div>
                        <div className="text-white">
                            Clear internal procedures are in place for staff to report suspicious transactions in accordance with regulatory requirements.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Record Keeping
                        </div>
                        <div className="text-white">
                            All identification records are securely kept for at least ten years post the termination of a business relationship.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Training

                        </div>
                        <div className="text-white">
                            Employees undergo specialised training for manual controls and risk assessments.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Auditing
                        </div>
                        <div className="text-white">
                            Regular internal audits are conducted to evaluate AML activities and compliance.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Data Security

                        </div>
                        <div className="text-white">
                            All user data is securely stored and protected. Data is shared only when legally required or for AML purposes.


                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Contact Information

                        </div>
                        <div className="text-white">
                            For questions or complaints regarding our AML policy, please contact us in the Discord server (<a className="text-white" href="https://discord.gg/arcad3" target="_blank">https://discord.gg/arcad3</a>)

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-white">
                            ARCAD3 is committed to maintaining the highest standards of financial security and regulatory compliance, ensuring a safe and trustworthy gaming environment for all its users.

                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AMLModal;