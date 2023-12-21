import { GetrecentFlickers } from "@/api/recent-flickers";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import Modal from "../modal/modal";
import RecentFlickersTable from "../recent-flickers-table/recentFlickerTable";
import { calculateTimeAgo } from "@/utils";
// ts-ignore
interface tableData {
	user_name: string;
	bet_amount: string;
	outcome: string;
	timeAgo: string;
	public_key: string;
	verified: boolean;
}

interface RecentFlickersModalProps {
	tableData: Array<tableData>;
	show: boolean;
	handleModal: () => void;
}


const RecentFlickersModal: FC<RecentFlickersModalProps> = ({ tableData, show, handleModal }) => {
	const colors = [
		"#ADFFC9",
		"#FFABBA",
		"#ADFAFF",
		"#D1ADFF",
		"#FFD9AD",
		"#FFABBA"
	]
	useEffect(() => {

	}, [tableData])

	return (
		<Modal customClass={'flickers-modal'} show={show} handleModal={handleModal}>
			<div className="flickers-new">
				<img
					className="close"
					src="/static/svgs/close.svg"
					onClick={handleModal}
				/>
				<div className="title">
					RECENT TUGGERZ
				</div>
				<div className="content">
					<div className="container">
						{
							tableData && tableData.map((item, idx) => (
								<div className="item" key={idx}>
									<div style={{ color: colors[idx % (colors.length)] }}>
										{item?.user_name != '' ? item.user_name : item.public_key.slice(0, 4) + "..." + item.public_key.slice(-4)}
									</div>
									<div>
										flipped <span>{parseFloat(item.bet_amount)} ARC</span> and <span style={{ color: item.outcome == 'won' ? '#5BEF4380' : '#EF434380' }}>{item.outcome}</span>
									</div>
									<div>
										{calculateTimeAgo(item.timeAgo)} Ago
										<img src={`/static/svgs/check_${item.verified ? 'active' : 'inactive'}.svg`} />
									</div>
								</div>
							))
						}
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default RecentFlickersModal;