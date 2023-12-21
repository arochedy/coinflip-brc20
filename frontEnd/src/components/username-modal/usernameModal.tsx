import { GetrecentFlickers } from "@/api/recent-flickers";
import { useQuery } from "@tanstack/react-query";
import { FC, useState, useEffect, useRef } from "react";
import { enqueueSnackbar } from "notistack";
import Modal from "../modal/modal";

interface UsernameModalProps {
	show: boolean;
  	handleModal: () => void;
	handleUserName: (username: string) => void;
}


const UsernameModal:FC<UsernameModalProps> = ({ show, handleModal, handleUserName }) => {
	const [username, setUserName] = useState('')
	const inputRef = useRef();

	const changeUserName = (value: string) => {
		setUserName(value)
	}

	useEffect(() => {
		// @ts-ignore
		inputRef.current.focus();
	})
  return(
		<Modal customClass={'username-modal'} show={show} handleModal={handleModal}>
			<div className="username">
				<img src="/static/svgs/close.svg" onClick={handleModal}/>
				<div className="username-title">
					Choose a your <br />username
				</div>
				<input 
					type="text" 
					value={username}
					onChange={(e) => {
						changeUserName(e.target.value);
					}}
					// @ts-ignore
					ref={inputRef}
				/>
				<button className="btn-outline" onClick={() => {
					if(username.length > 5) {
						enqueueSnackbar("Username length limits up to 5", {
							variant: "error",
							anchorOrigin: { horizontal: "left", vertical: "top" },
						  });
					} else {
						handleUserName(username)
					}
				}}>Done</button>
			</div>
		</Modal>
  )
}

export default UsernameModal;