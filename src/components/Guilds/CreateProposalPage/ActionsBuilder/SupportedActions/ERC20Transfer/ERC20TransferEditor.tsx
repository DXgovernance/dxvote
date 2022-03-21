import { FiNavigation } from 'react-icons/fi';
import {
  EditorWrapper,
  HeaderWrapper,
  IconWrapper,
  TitleWrapper,
} from '../common/editor';
import { ActionEditorProps } from '..';
import Transfer from './Transfer';

const ERC20TransferEditor: React.FC<ActionEditorProps> = ({
  call,
  decodedCall,
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

      <Transfer call={call} decodedCall={decodedCall} updateCall={updateCall} />

      {/* <FooterWrapper>
        <AddButton label="Add Recipient" />
      </FooterWrapper> */}
    </EditorWrapper>
  );
};

export default ERC20TransferEditor;
