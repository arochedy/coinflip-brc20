
import { FC, useState, useEffect } from "react";
import Modal from "../modal/modal";


interface RankModalProps {
	show: boolean;
	handleModal: () => void;
	// @ts-ignore
	data: Array;
	myAddress: string;
}

const RankModal: FC<RankModalProps> = ({ show, handleModal, data, myAddress }) => {
	const colors = [
		"#ADFFC9",
		"#FFABBA",
		"#ADFAFF",
		"#D1ADFF",
		"#FFD9AD",
		"#FFABBA"
	];
	const [firstData, setFirstData] = useState([]);
	const [middleData, setMiddleData] = useState([]);
	const [endData, setEndData] = useState([]);

	useEffect(() => {
		// ws.onmessage = function(event) {
		// 	const message = JSON.parse(event.data);
		// 	if(message.hasOwnProperty('balance')) {
		// 		alert('ok')
		// 	}
		// }


	}, [])

	useEffect(() => {
		var myAddressIdx = 0;


		for (let i = 0; i < data.length; i++) {
			if (myAddress == data[i].public_key) {
				myAddressIdx = i;
				break;
			}
		}

		if (data.length >= 10) {
			// @ts-ignore
			let tempFirstData = [];
			// @ts-ignore
			let tempMiddleData = [];
			// @ts-ignore
			let tempEndData = [];

			for (let i = 0; i < 5; i++) {
				// @ts-ignore
				tempFirstData = [...tempFirstData, data[i]];
			}
			// @ts-ignore
			setFirstData(tempFirstData);

			for (let i = -2; i < 3; i++) {
				if ((myAddressIdx + i) >= 5 && ((myAddressIdx + i) < (data.length - 5))) {
					// @ts-ignore
					tempMiddleData = [...tempMiddleData, data[myAddressIdx + i]];
				}
			}
			// @ts-ignore
			setMiddleData(tempMiddleData);

			for (let i = 0; i < 5; i++) {
				// @ts-ignore
				tempEndData = [data[data.length - 1 - i], ...tempEndData];
			}
			// @ts-ignore
			setEndData(tempEndData);
		} else {
			// @ts-ignore
			let tempFirstData = [];
			for (let i = 0; i < data.length; i++) {
				// @ts-ignore
				tempFirstData = [data[i], ...tempFirstData];
			}
			// @ts-ignore
			setFirstData(tempFirstData);
		}
	}, [myAddress, data])

	return (
		<Modal customClass={'rank-modal'} show={show} handleModal={handleModal}>
			<div className="rank">
				<div className="close">
					<img src="/static/svgs/close.svg" onClick={handleModal} />
				</div>
				<div className="rank-title text-yellow title">
					Leaderboard
				</div>
				<div className="content">
					{
						// @ts-ignore
						firstData.map((item, idx) => (
							// @ts-ignore
							<div className={`item ${idx == 0 && 'top'} ${item.public_key == myAddress && 'you'}`} key={item.public_key}>
								<div className="first">
									{
										idx == 0 && <img src="/static/img/star.PNG" />
									}
									<span>
										{
											/* @ts-ignore */
											item.current_position}
									</span>
								</div>
								<div className="second">
									{
										idx == 0 && <div className="top-span">Top flicker</div>
									}
									<div className="values">
										{/* @ts-ignore */}
										<div style={{ color: item.public_key != myAddress && colors[idx % colors.length] }}>{item.user_name == '' ? item.public_key.slice(0, 4) + '...' + item.public_key.slice(-4) : (item.public_key == myAddress ? 'YOU' : (item.user_name.length > 10 ? item.user_name.slice(0, 10) + '...' : item.user_name))}</div>
										<div>{
											// @ts-ignore
											item.total_points} <span>xp</span></div>
									</div>
								</div>
							</div>
						))
					}
					{
						// @ts-ignore
						(firstData.length > 0 && middleData.length > 0 && (middleData[0].current_position - firstData[firstData.length - 1].current_position > 1))
						&&
						<div className="reduce">
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
						</div>
					}
					{
						// @ts-ignore
						(middleData.length == 0 && endData.length > 0 && firstData.length > 0 && (endData[0].current_position - firstData[firstData.length - 1].current_position > 1))
						&&
						<div className="reduce">
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
						</div>
					}
					{
						// @ts-ignore
						middleData.map((item, idx) => (<div className={`item ${item.public_key == myAddress && 'you'}`} key={item.public_key}>
							<div className="first">
								<span>
									{
										// @ts-ignore
										item.current_position}
								</span>
							</div>
							<div className="second">
								<div className="values">
									{/* @ts-ignore */}
									<div style={{ color: item.public_key != myAddress && colors[idx % colors.length] }}>{item.public_key == myAddress ? 'YOU' : (item.user_name.length > 10 ? item.user_name.slice(0, 10) + '...' : item.user_name)}</div>
									<div>{
										// @ts-ignore
										item.total_points} <span>xp</span></div>
								</div>
							</div>
						</div>
						))
					}

					{
						// @ts-ignore
						endData.length > 0 && middleData.length > 0 && (endData[0].current_position - middleData[middleData.length - 1].current_position > 1) &&
						<div className="reduce">
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
							<div className="reduce-item">
							</div>
						</div>
					}
					{
						// @ts-ignore
						endData.map((item, idx) => (<div className={`item ${item.public_key == myAddress && 'you'}`} style={{ marginTop: (idx == 0 && 'auto') }} key={item.public_key}>
							<div className="first">
								<span>
									{// @ts-ignore
										item.current_position}
								</span>
							</div>
							<div className="second">
								<div className="values">
									{/* @ts-ignore */}
									<div style={{ color: item.public_key != myAddress && colors[idx % colors.length] }}>{item.public_key == myAddress ? 'YOU' : (item.user_name.length > 10 ? item.user_name.slice(0, 10) + '...' : item.user_name)}</div>
									<div>{
										// @ts-ignore
										item.total_points} <span>xp</span></div>
								</div>
							</div>
						</div>
						))
					}
				</div>
			</div>
		</Modal>
	)
}

export default RankModal;