import styled from 'styled-components';
import { IconButton } from 'old-components/Guilds/common/Button';
import { Badge } from 'old-components/Guilds/common/Badge';

export const IconHolder = styled.span`
  display: flex;
  justify-content: center;

  @media only screen and (min-width: 768px) {
    margin-right: 0.3rem;
  }

  img {
    border-radius: 50%;
    margin-right: 0;
  }
`;

export const StyledAddressButton = styled(IconButton)`
  margin-top: 0;
  margin-bottom: 0;
  padding: 0.3rem;

  @media only screen and (min-width: 768px) {
    padding: 0.3rem 0.5rem;
  }

  /* hover state for when having child Badge */
  &:hover,
  &:active {
    ${Badge} {
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const AddressText = styled.span`
  margin-left: 0.2rem;
  margin-right: 0.3rem;
`;

