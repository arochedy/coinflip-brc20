import { FC } from "react";
import Modal from "../modal/modal";


interface KYCModal {
    show: boolean;
    handleModal: () => void;
}

const KYCModal: FC<KYCModal> = ({ show, handleModal }) => {
    return (
        <Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
            <div className="faq">
                <div className="close">
                    <img src="/static/svgs/close.svg" onClick={handleModal} />
                </div>
                <div className="faq-title text-yellow title">
                    ARCAD3 KYC Policy
                </div>
                <br />
                <p>Last Updated: December 2023</p>
                <div className="content">
                    <div className="item">
                        <div className="text-yellow">
                            Introduction
                        </div>
                        <div className="text-white">
                            At ARCAD3, we adhere to stringent Know Your Customer (KYC) requirements to ensure the security and integrity of our platform. This policy is in effect for all users making substantial transactions on ARCAD3.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            KYC Process
                        </div>
                        <div className="text-white">
                            When a user’s total deposit or withdrawal exceeds $10,000, full KYC verification may be required.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Verification Requirements
                        </div>
                        <div className="text-white">
                            Users must provide the following: <br />
                            1. Government Issued Photo ID: A clear copy of the front (and back, if required) of the ID. <br />
                            2. Selfie with ID: A selfie holding the ID document. <br />
                            3. Proof of Residence: A recent (within 3 months) bank statement or utility bill showing the user’s full name and address.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Review and Approval
                        </div>
                        <div className="text-white">
                            Upon submission, users will attain a “Temporarily Approved” status. The KYC Team will review the documents within 24 hours and communicate the outcome via email: <br />
                            - Approval <br />
                            - Rejection <br />
                            - Request for additional information

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            During “Temporarily Approved” status:
                        </div>
                        <div className="text-white">
                            - Users may continue to use the platform. <br />
                            - Withdrawals are not permitted.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Guidelines for Document Verification
                        </div>
                        <div className="text-white">
                            1. Proof of ID: <br />
                            - Must include a signature. <br />
                            - The issuing country should not be a restricted territory. <br />
                            - Full name matches the user’s registered name. <br />
                            - The document must be valid for at least 3 more months. <br />
                            - User must be over 18 years old.
                        </div>
                        <div className="text-white">
                            2. Proof of Residence:<br />
                            - Acceptable documents: Bank Statement or Utility Bill.<br />
                            - Issuing country should not be a restricted territory.
                            <br />
                            - Full name matches the name on the ID document.
                            <br />
                            - Issued within the last 3 months.
                            <br />
                        </div>
                        <div className="text-white">
                            3. Selfie with ID:
                            <br />
                            - Must clearly show the user and the ID.
                            <br />
                            - The ID in the selfie must match the submitted Proof of ID.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Failure of KYC Process

                        </div>
                        <div className="text-white">
                            If KYC is unsuccessful, reasons will be documented, and the user will be notified with a support ticket number for reference. Once all required documents are verified, the account will be fully approved.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Additional AML Measures

                        </div>
                        <div className="text-white">
                            - Users who have not completed KYC cannot make further deposits or withdrawals. <br />
                            - Withdrawals are subject to algorithmic and manual checks for legitimacy of platform activity. <br />
                            - Direct user-to-user fund transfers are prohibited.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Contact and Complaints

                        </div>
                        <div className="text-white">
                            For inquiries or complaints regarding our KYC policy, contact us in the Discord server (<a className="text-white" href="https://discord.gg/arcad3" target="_blank">https://discord.gg/arcad3</a>).

                        </div>
                        <div className="text-white">
                            *Restricted Territories include, but are not limited to, the United States of America and its territories, France, the Netherlands and its territories, Australia, Austria, Germany, the United Kingdom, Spain, and Cyprus.

                        </div>
                        <div className="text-white">
                            ARCAD3 is committed to maintaining the highest standards of regulatory compliance and user safety.
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    )
}

export default KYCModal;