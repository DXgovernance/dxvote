import { ButtonIcon } from "../common/Button";

interface AvatarProps {
    avatarUri: string
}

const Avatar: React.FC<AvatarProps> = ({ avatarUri }) => {

    const avatarSrc = "123"
    return (
        <ButtonIcon src={avatarSrc} alt={'Avatar'} />
    )
}

export default Avatar;