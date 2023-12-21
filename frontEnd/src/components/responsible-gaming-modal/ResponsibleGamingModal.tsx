import { FC } from "react";
import Modal from "../modal/modal";


interface ResponsibleGamingModal {
    show: boolean;
    handleModal: () => void;
}

const ResponsibleGamingModal: FC<ResponsibleGamingModal> = ({ show, handleModal }) => {
    return (
        <Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
            <div className="faq">
                <div className="close">
                    <img src="/static/svgs/close.svg" onClick={handleModal} />
                </div>
                <div className="faq-title text-yellow title">
                    Play Responsibly with ARCAD3
                </div>
                <br />
                <p>
                    Experience gaming that's both safe and enjoyable with ARCAD3. We're committed to helping you maintain control over your gaming habits. Here are some key guidelines to ensure a safer, smarter gaming experience:

                </p>
                <div className="content">
                    <div className="item">
                        <div className="text-yellow">
                            Plan Your Gaming Sessions
                        </div>
                        <div className="text-white">
                            Set clear limits for both time and money before you start playing. This helps you stay in control.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Adhere to Your Budget
                        </div>
                        <div className="text-white">
                            Game only what you can afford to lose. Remember, it's about fun, not funds.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Play for Entertainment
                        </div>
                        <div className="text-white">
                            Gaming is a form of entertainment, not a way to earn money. Avoid trying to recoup losses or 'chase' them.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Stay Level-Headed
                        </div>
                        <div className="text-white">
                            Avoid Gaming under the influence of alcohol or drugs.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Recognise When to Pause
                        </div>
                        <div className="text-white">
                            If you're feeling upset, angry, or depressed, it's not the right time to Game.
                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            ARCAD3's Support Tools
                        </div>
                        <div className="text-white">
                            Your ARCAD3 account is equipped with features to promote responsible gaming. Reach out to our customer service team for assistance with these tools.

                        </div>
                        <div className="separator" />
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Monitor with Account History

                        </div>
                        <div className="text-white">
                            Your Account History is always accessible, providing details on your balance and gaming duration.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Manage Spending

                        </div>
                        <div className="text-white">
                            Set daily, weekly, or monthly limits for yourself to ensure you don't exceed your budget.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Take a Short Break
                        </div>
                        <div className="text-white">
                            Need a break? Temporarily disable your account.
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Protecting Young Users
                        </div>
                        <div className="text-white">
                            ARCAD3 is strictly for those aged 18 and over. Use filtering software if you share your computer with minors. Reliable options include: <br />
                            - [netnanny.com](https://www.netnanny.com) <br />
                            - [childnet.com](https://www.childnet.com)

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Financial Management Advice
                        </div>
                        <div className="text-white">
                            For guidance on money management, consider these resources: <br />
                            - Citizens Advice: Offers budgeting and debt handling advice. <br />
                            - The Money Advice Service: A government-supported platform providing free financial advice.

                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Get in Touch with ARCAD3

                        </div>
                        <div className="text-white">
                            Our customer service team is ready to assist you promptly and efficiently. <br />
                            - Live Chat in Discord server (<a className="text-white" href="https://discord.gg/arcad3" target="_blank">https://discord.gg/arcad3</a>)
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Evaluate Your Gaming Habits
                        </div>
                        <div className="text-white">
                            Use GamCare’s quick, confidential test to assess your gaming habits: <br />
                            [Take the test](<a className="text-white" href="https://www.gamcare.org.uk/get-support/self-assessment-tool/" target="_blank">https://www.gamcare.org.uk/get-support/self-assessment-tool/</a>)
                        </div>
                    </div>
                    <div className="item">
                        <div className="text-yellow">
                            Seeking Additional Support

                        </div>
                        <div className="text-white">
                            If you or someone you know is grappling with Gaming issues, these organisations offer expert advice: <br />
                            - GamCare: Support for Gamers and their close ones. <br />
                            - Big Deal: Guidance on discussing Gaming issues with young people. <br />
                            - GameAware: Informed decision-making about Gaming. <br />
                            - Gaming Therapy: Non-UK residents can receive advice and support for problem Gaming.
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ResponsibleGamingModal;