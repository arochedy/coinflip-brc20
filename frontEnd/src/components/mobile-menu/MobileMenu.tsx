import { FC, useState, useEffect } from "react";
import Modal from "../modal/modal";

interface MobileMenuProps {
	show: boolean;
	isLoggedin: boolean;
	handleModal: () => void;
	handleFaqModal: () => void;
	playButtonAudio: () => void;
	handleDepositModal: () => void;
	handlePrizeModal: () => void;
	handleRankModal: () => void;
	handleProfileModal: () => void;
	handleWithdrawlModal: () => void;
	logout: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({
	show,
	handleModal,
	isLoggedin,
	handleFaqModal,
	playButtonAudio,
	handleDepositModal,
	handleWithdrawlModal,
	handlePrizeModal,
	handleRankModal,
	handleProfileModal,
	logout,
}) => {
	return (
		<Modal customClass={'mobile-menu-modal'} show={show} handleModal={handleModal}>
			<div className="mobile-menu">
				<div className="close">
					<img src="/static/svgs/close.svg" onClick={handleModal} />
				</div>
				<div className="content">
					{
						isLoggedin && <>
							<div className="item">
								<div
									className="text-white"
									onClick={() => {
										handleModal();
										playButtonAudio();
										handleWithdrawlModal();
									}}
								>
									Withdraw
								</div>
								<div className="separator" />
							</div>
							<div className="item">
								<div
									className="text-white"
									onClick={() => {
										handleModal();
										playButtonAudio();
										handleDepositModal();
									}}
								>
									Deposit
								</div>
								<div className="separator" />
							</div>
							<div className="item">
								<div
									className="text-white"
									onClick={() => {
										handleModal();
										playButtonAudio();
										handlePrizeModal();
									}}
								>
									Gift
								</div>
								<div className="separator" />
							</div>
							<div className="item">
								<div
									className="text-white"
									onClick={() => {
										handleModal();
										playButtonAudio();
										handleRankModal();
									}}
								>
									Rank
								</div>
								<div className="separator" />
							</div>
							<div className="item">
								<div
									className="text-white"
									onClick={() => {
										handleModal();
										playButtonAudio();
										handleProfileModal();
									}}
								>
									Profile
								</div>
								<div className="separator" />
							</div>
						</>
					}
					{
						isLoggedin &&
						<div className="item">
							<div
								className="text-white"
								onClick={() => {
									handleModal();
									logout();
								}}
							>
								Logout
							</div>
						</div>
					}
				</div>
			</div>
		</Modal>
	)
}

export default MobileMenu;