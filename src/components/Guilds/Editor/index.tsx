import styled from 'styled-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Focus from '@tiptap/extension-focus';
import Highlight from '@tiptap/extension-highlight';
import MenuBar from './MenuBar';
import TurndownService from 'turndown';
import './styles.scss';

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
