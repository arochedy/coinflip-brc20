import { FC, useEffect } from "react";
import Modal from "../modal/modal";
// ts-ignore

interface BadgesModal {
    badges: string[],
    show: boolean;
    handleModal: () => void;
}


const BadgesModal: FC<BadgesModal> = ({ badges, show, handleModal }) => {

    return (
        <Modal customClass={'badge-modal'} show={show} handleModal={handleModal}>
            <div className="badges__wrapper">
                <img src="/static/svgs/close.svg" className="close" onClick={handleModal} />
                <div className="title">
                    {badges.length == 1 ? "You got a new badge" : `You got ${badges.length} new badges`}
                </div>
                <div className="badges_row">
                    {
                        badges.length && badges.map(badge => (
                            <div className="badges_item" key={badge}>
                                <div className="badge_image">
                                    {<img src={`/static/img/badges/${badge}.webp`} alt={badge} />}
                                </div>

                            </div>
                        ))
                    }
                </div>
            </div>
        </Modal>
    )
}

export default BadgesModal;