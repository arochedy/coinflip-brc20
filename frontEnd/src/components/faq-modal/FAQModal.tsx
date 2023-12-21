import { FC } from "react";
import Modal from "../modal/modal";


interface FaqModalProps {
	show: boolean;
  handleModal: () => void;
}

const FaqModal:FC<FaqModalProps> = ({ show, handleModal }) => {
  return(
		<Modal customClass={'faq-modal'} show={show} handleModal={handleModal}>
			<div className="faq">
				<div className="close">
					<img src="/static/svgs/close.svg" onClick={handleModal}/>
				</div>
				<div className="faq-title text-yellow title">
					FAQ
				</div>
				<div className="content">
					<div className="item">
						<div className="text-yellow">
						  What is ARCAD3?
						</div>
						<div className="text-white">
						  ARCAD3 is our mother brand for blockchain games, built on the Bitcoin (BTC) blockchain. We aim to provide engaging gaming experiences with the blockchain technology and cryptocurrency at the core.
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
						  What is "Tug the Nuggz"?
						</div>
						<div className="text-white">
						  "Tug the Nuggz" is one of our games under ARCAD3. It's a simple heads or tails game where you can double your bet or lose it all. You can play it using $ARC3 tokens.
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
						  How do I get $ΛRC tokens?
						</div>
						<div className="text-white">
						  To obtain $ΛRC tokens, you can deposit Bitcoin ($BTC). The $BTC you deposit will be converted into $ΛRC tokens, which you can use to play "Tug the Nuggz."
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
						  What are the rewards for playing "Tug the Nuggz"?
						</div>
						<div className="text-white">
						  Every play in "Tug the Nuggz" earns you XP rewards on top of your bets. These XP points can be redeemed for prizes, including unique ordinals from our sub-brands Bazuki and Irezumi.
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
							How can I track my stats, manage referrals, and connect my wallet, including deposit requirements?
						</div>
						<div className="text-white">
							You will need to use a bitcoin wallet, we support unisat, xverse, and leather wallet, once you have downlaoded the wallet you can click the start button. chose the account you want to sign up with and sign a message with the public key associated with that account.
							At that point you will have created an account as well as have access to all your stats through the menu, and the deposits through the deposit menu.  
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
						  What are Bazuki and Irezumi?
						</div>
						<div className="text-white">
						  Bazuki and Irezumi are sub-brands of ARCAD3, offering a range of unique and collectible ordinals that you can acquire using your XP rewards. Each sub-brand has its own distinct offerings.
						</div>
						<div className="separator" />
					</div>
					<div className="item">
						<div className="text-yellow">
						  How do you ensure trust and security in your games?
						</div>
						<div className="text-white">
						  We use frictionless Bitcoin and trustless execution to ensure transparency and security in our games. Our smart contracts and blockchain technology provide a fair and secure gaming experience.
						</div>
					</div>
				  <div className="item">
					  <div className="text-yellow">
						  Can I withdraw my $ΛRC tokens back into Bitcoin ($BTC) if I decide to cash out my earnings?
					  </div>
					  <div className="text-white">
						  $ΛRC tokens can be withdrawn from the platform into your personal wallet but we dont operate and exchange of $ΛRC tokens to Bitcoin ($BTC)
					  </div> 
				  </div>
				</div>
			</div>
		</Modal>
  )
}

export default FaqModal;