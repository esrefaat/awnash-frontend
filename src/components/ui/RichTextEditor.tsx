'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
  faQuoteLeft,
  faCode,
  faUndo,
  faRedo,
  faLink,
  faHeading
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg border transition-colors',
        isActive 
          ? 'bg-awnash-primary text-black border-awnash-primary' 
          : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
      )}
      title={title}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
    </button>
  );

  return (
    <div className={cn('border border-gray-600 rounded-2xl overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b border-gray-600 bg-gray-700 p-3">
        <div className="flex flex-wrap gap-2">
          {/* Text formatting */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={faBold}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={faItalic}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              icon={faStrikethrough}
              title="Strikethrough"
            />
          </div>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Headings */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              icon={faHeading}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              icon={faHeading}
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              icon={faHeading}
              title="Heading 3"
            />
          </div>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Lists */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={faListUl}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={faListOl}
              title="Numbered List"
            />
          </div>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Other formatting */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={faQuoteLeft}
              title="Quote"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              icon={faCode}
              title="Inline Code"
            />
          </div>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={faUndo}
              title="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={faRedo}
              title="Redo"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-gray-800 text-white min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="h-full"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
