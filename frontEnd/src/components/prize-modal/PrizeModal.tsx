"use client"
import { FC, useState, useEffect } from "react";
import Modal from "../modal/modal";
import Image from "next/image";


interface PrizeModalProps {
	show: boolean;
	handleModal: () => void;
}

interface Image {
	type: string;
	name: string;
	path: string;
	directory: string;
}

interface Folder {
	type: string;
	name: string;
	path: string;
	images: Image[];
}

const PrizeModal: FC<PrizeModalProps> = ({ show, handleModal }) => {
	const [imagelists, setimagelists] = useState<Folder[] | undefined>([])
	const [activePrizeFilter, setActivePrizeFilter] = useState("")


	useEffect(() => {

		(async function () {
			if (!imagelists?.length) {
				const res = await fetch(`${process.env.NODE_ENV == "development" ? "http://localhost:3000" : "https://arcd.io/"}/api/getBadgeImages`);
				const data = await res.json();
				setimagelists(data.data)
				setActivePrizeFilter("irezumi")
			}
		})()
	}, [])


	const handleTabChange = (title: string) => {
		setActivePrizeFilter(title)
	}

	return (
		<Modal customClass={'prize-modal'} show={show} handleModal={handleModal}>
			<div className="prize">
				<div className="close">
					<img src="/static/svgs/close.svg" onClick={handleModal} />
				</div>
				<div className="prize-title text-yellow title">
					Rewards
				</div>
				<ul className="prize__filter">
					{imagelists && imagelists.map(folder => {
						return <li onClick={() => handleTabChange(folder.name)} className={`${folder.name.replace(" ", "")} ${activePrizeFilter === folder.name ? "active" : ""}`} key={folder.name}>{folder.name}</li>
					})}
				</ul>

				{
					imagelists && imagelists.map(folder => {
						return <div className={`${folder.name == activePrizeFilter ? "active" : ""} content`} key={folder.name}>
							{
								folder.images && folder.images.map(image => {
									return <div className="item" key={image.name}>
										<div className="item-image">
											<a href={`https://ord.io/${image.name.split(".")[0]}`} target="_blank" className="prize__link">
												{image.name == "18600110.webp" && <i className="prize__emoji">🍕</i>}
												{/* <img src={`${folder.path}/${image.name}`} /> */}
												{/* <Image  alt={image.name} fill loading="lazy" sizes="" /> */}
												<img loading="lazy" src={`${folder.path}/${image.name}`} alt={folder.path} />
												<div className="badges">
													<div className="arc">
														<span>{image.name.split(".")[0]}</span>
													</div>
												</div>
											</a>
										</div>
										<div className="item-lock">
											<img src="/static/svgs/lock.svg" />
										</div>
									</div>
								})
							}
						</div>
					})
				}

			</div>
		</Modal>
	)
}

export default PrizeModal;