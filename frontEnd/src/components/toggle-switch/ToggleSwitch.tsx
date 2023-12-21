
interface toggleSwitch {
    handleToggle: () => void
}

const ToggleSwitch: React.FC<toggleSwitch> = ({ handleToggle }) => {
    return (
        <button>
            <span>

            </span>
        </button>
    )
}

export default ToggleSwitch
