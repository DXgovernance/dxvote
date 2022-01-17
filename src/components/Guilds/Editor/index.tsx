import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Focus from '@tiptap/extension-focus';
import Highlight from '@tiptap/extension-highlight';
import MenuBar from './MenuBar';
import TurndownService from 'turndown';
import './styles.scss';

var turndownService = new TurndownService();

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
      <div className="editor">
        {editor && <MenuBar editor={editor} />}
        <EditorContent className="editor__content" editor={editor} />
        <div className="editor__footer"></div>
      </div>
    </div>
  );
};

export default Editor;
