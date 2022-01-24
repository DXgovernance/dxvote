import styled, { css } from 'styled-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Focus from '@tiptap/extension-focus';
import Highlight from '@tiptap/extension-highlight';
import MenuBar from './MenuBar';
import TurndownService from 'turndown';

var turndownService = new TurndownService();

const EditorWrap = styled.div`
  background-color: #fff;
  border: 1px solid #0d0d0d;
  border-radius: 10px;
  color: #0d0d0d;
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
  ${({}) =>
    css`
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
          background-color: rgba(#616161, 0.1);
          color: #616161;
        }

        pre {
          background: #0d0d0d;
          border-radius: 10px;
          color: #fff;
          font-family: 'JetBrainsMono', monospace;
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
          border-left: 2px solid rgba(#0d0d0d, 0.1);
          padding-left: 1rem;
        }

        hr {
          border: none;
          border-top: 2px solid rgba(#0d0d0d, 0.1);
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

const Editor = () => {
  const initialJson = localStorage.getItem(
    'guild-newProposal-description-json'
  );

  const editor = useEditor({
    content: initialJson
      ? {
          ...JSON.parse(initialJson),
        }
      : {},
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
        localStorage.setItem(
          'guild-newProposal-description-json',
          JSON.stringify(editor.getJSON())
        );
        localStorage.setItem('guild-newProposal-description-html', html);
        localStorage.setItem(
          'guild-newProposal-description-md',
          turndownService.turndown(html)
        );
      }
    },
  });

  return (
    <div>
      <EditorWrap>
        {editor && <MenuBar editor={editor} />}
        <Content editor={editor} />
      </EditorWrap>
    </div>
  );
};

export default Editor;
