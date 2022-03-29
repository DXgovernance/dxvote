import { FiNavigation } from 'react-icons/fi';
import {
  EditorWrapper,
  FooterWrapper,
  HeaderWrapper,
  IconWrapper,
  TitleWrapper,
} from '../common/editor';
import { ActionEditorProps } from '..';
import Transfer from './Transfer';
import AddButton from '../../common/AddButton';

const ERC20TransferEditor: React.FC<ActionEditorProps> = ({
  call,
  contract,
  updateCall,
}) => {
  return (
    <EditorWrapper>
      <HeaderWrapper>
        <IconWrapper>
          <FiNavigation size={16} />
        </IconWrapper>
        <TitleWrapper>Transfers & Mint</TitleWrapper>
      </HeaderWrapper>

      <Transfer contract={contract} call={call} updateCall={updateCall} />

      <FooterWrapper>
        <AddButton label="Add Recipient" />
      </FooterWrapper>
    </EditorWrapper>
  );
};

export default ERC20TransferEditor;
