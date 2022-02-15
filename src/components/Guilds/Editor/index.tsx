import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Focus from '@tiptap/extension-focus';
import Highlight from '@tiptap/extension-highlight';
import MenuBar from './MenuBar';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

const EditorWrap = styled.div`
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  max-height: 26rem;
}
`;

const Content = styled(EditorContent)`
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 1rem;
  -webkit-overflow-scrolling: touch;
  ${css`
    .ProseMirror {
      > * + * {
        margin-top: 0.75em;
      }

      outline: none;
      min-height: 200px;

      ul,
      ol {
        padding: 0 1rem;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        line-height: 1.1;
      }

      code {
        background-color: ${({ theme }) =>
          transparentize(0.8, theme.colors.muted)};
        color: ${({ theme }) => theme.colors.muted};
      }

      pre {
        background: ${({ theme }) => theme.colors.primary};
        border-radius: 10px;
        color: ${({ theme }) => theme.colors.background};
        padding: 0.75rem 1rem;

        code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }
      }

      mark {
        background-color: #faf594;
      }

      img {
        height: auto;
        max-width: 100%;
      }

      hr {
        margin: 1rem 0;
      }

      blockquote {
        border-left: 2px solid
          ${({ theme }) => transparentize(0.9, theme.colors.primary)};
        padding-left: 1rem;
      }

      hr {
        border: none;
        border-top: 2px solid
          ${({ theme }) => transparentize(0.8, theme.colors.primary)};
        margin: 2rem 0;
      }

      ul[data-type='taskList'] {
        list-style: none;
        padding: 0;

        li {
          align-items: center;
          display: flex;

          > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
          }

          > div {
            flex: 1 1 auto;
          }
        }
      }
    }
  `}
`;

interface EditorProps {
  onHTMLChange?: (string) => void;
  onMdChange?: (string) => void;
  onJSONChange?: (string) => void;
  content?: string;
}
const Editor: React.FC<EditorProps> = ({
  onHTMLChange,
  onMdChange,
  onJSONChange,
  content,
}) => {
  const editor = useEditor({
    content: content ? content : {},
    extensions: [
      StarterKit.configure({
        history: { depth: 10 },
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Highlight,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html) {
        onHTMLChange && onHTMLChange(html);
        onMdChange && onMdChange(turndownService.turndown(html));
        onJSONChange && onJSONChange(JSON.stringify(editor.getJSON()));
      }
    },
  });

  return (
    <div>
      <EditorWrap>
        {editor && <MenuBar editor={editor} />}
        <Content editor={editor} data-testId="editor-content" />
      </EditorWrap>
    </div>
  );
};

export default Editor;
