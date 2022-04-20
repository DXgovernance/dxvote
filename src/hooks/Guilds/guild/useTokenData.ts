import { useParams } from "react-router-dom";
import { useGuildConfig } from "../ether-swr/guild/useGuildConfig";
import { useERC20Info } from "../ether-swr/erc20/useERC20Info";

export const useTokenData = () => {
    const { guild_id: guildId } =
    useParams<{ chain_name?: string; guild_id?: string }>();
    const { data } = useGuildConfig(guildId);
    const { data: tokenData } = useERC20Info(data?.token);
    
    return {
        tokenData
    }
}

