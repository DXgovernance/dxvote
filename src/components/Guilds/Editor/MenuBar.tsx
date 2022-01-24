import { Fragment } from 'react';
import styled from 'styled-components';

import MenuItem from './MenuItem';

const Header = styled.div`
  align-items: center;
  border-bottom: 1px solid #0d0d0d;
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  padding: 0.25rem;
`;
const Divider = styled.div`
  background-color: rgba(#000, 0.1);
  height: 1.25rem;
  margin-left: 0.5rem;
  margin-right: 0.75rem;
  width: 2px;
`;

const MenuBar = ({ editor }) => {
  const items = [
    {
      icon: 'h-1',
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: 'h-2',
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      title: 'divider',
    },
    {
      icon: 'bold',
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: 'italic',
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: 'strikethrough',
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },

    {
      title: 'divider',
    },
    {
      icon: 'code-view',
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      icon: 'double-quotes-l',
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: 'mark-pen-line',
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      title: 'divider',
    },
    {
      icon: 'paragraph',
      title: 'Paragraph',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive('paragraph'),
    },
    {
      icon: 'list-unordered',
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: 'list-ordered',
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      title: 'divider',
    },
    {
      icon: 'separator',
      title: 'Horizontal Rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: 'divider',
    },
    {
      icon: 'arrow-go-back-line',
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: 'arrow-go-forward-line',
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <Header>
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.title === 'divider' ? <Divider /> : <MenuItem {...item} />}
        </Fragment>
      ))}
    </Header>
  );
};

export default MenuBar;
