import { ImPencil } from 'react-icons/im';
import { MdCreditCard } from 'react-icons/md';
import { ReactComponent as Vector } from '../assets/images/vector.svg';
import { ReactComponent as Signal } from '../assets/images/signal.svg';
import { AiOutlinePlus } from 'react-icons/ai';

interface ProposalTypesConfigProps {
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onChainAction: boolean;
}

export const ProposalTypesConfig: ProposalTypesConfigProps[] = [
  {
    title: 'Signal Proposal',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam, blandit eu sapien eu, commodo dapibus nisl.',
    icon: Signal,
    onChainAction: false,
  },

  {
    title: 'Tranfer Funds',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam, blandit eu sapien eu, commodo dapibus nisl.',
    icon: Vector,
    onChainAction: false,
  },
  {
    title: 'Contributer Payment',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam, blandit eu sapien eu, commodo dapibus nisl.',
    icon: MdCreditCard,
    onChainAction: true,
  },
  {
    title: 'Mint Reputation',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam, blandit eu sapien eu, commodo dapibus nisl.',
    icon: AiOutlinePlus,
    onChainAction: true,
  },
  {
    title: 'Custom Proposal',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam, blandit eu sapien eu, commodo dapibus nisl.',
    icon: ImPencil,
    onChainAction: true,
  },
];
