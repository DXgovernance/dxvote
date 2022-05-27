export interface ProposalTypeDescriptionProps {
  title: string;
  description: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  onChainAction: boolean;
}

export interface ProposalTypesProps {
  data: ProposalTypeDescriptionProps[];
}
