import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Node } from "@tiptap/core";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import useAuth from "../context/useAuth";
import NoUserAbout from "./NoUserAbout";

// Custom Video Extension
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ node }) {
    return [
      "video",
      {
        controls: true,
        src: node.attrs.src,
        class: "rounded-lg max-w-full my-4",
      },
    ];
  },
  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

const TipTap = ({ onSave }) => {
  const { user } = useAuth();

  const fontOptions = [
    { label: "Default", value: "" },
    { label: "Inter", value: "Inter" },
    { label: "Comic Sans", value: '"Comic Sans MS", "Comic Sans"' },
    { label: "Serif", value: "serif" },
    { label: "Monospace", value: "monospace" },
    { label: "Cursive", value: "cursive" },
    { label: "Exo 2", value: '"Exo 2"' },
  ];

  const applyFont = (event) => {
    if (!editor) return;
    const font = event.target.value;
    editor.chain().focus().setFontFamily(font).run();
  };

  const handleAddLink = () => {
    const url = prompt("Enter the link URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank" })
        .run();
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      if (!editor) return;
      const files = e.target.files;
      if (!files) return;

      const images = Array.from(files).map((file) => {
        const imgURL = URL.createObjectURL(file);
        return `<img src="${imgURL}" class="rounded-md max-w-full my-2" />`;
      });

      if (images.length > 0) {
        editor
          .chain()
          .focus()
          .insertContentAt(editor.state.selection.$anchor.pos, images.join(""))
          .run();
      }
    };
    input.click();
  };

  const handleVideoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = true;
    input.onchange = (e) => {
      if (!editor) return;
      const files = e.target.files;
      if (!files) return;

      const videos = Array.from(files).map((file) => {
        const videoURL = URL.createObjectURL(file);
        return `<video controls src="${videoURL}" class="rounded-md max-w-full my-2"></video>`;
      });

      if (videos.length > 0) {
        editor
          .chain()
          .focus()
          .insertContentAt(editor.state.selection.$anchor.pos, videos.join(""))
          .run();
      }
    };
    input.click();
  };

  const removeSelectedMedia = () => {
    if (editor) editor.chain().focus().deleteSelection().run();
  };

  const handleEditor = async () => {
    const json = editor.getJSON();

    let title = "";
    let content = [];

    json.content.forEach((node) => {
      if (node.type === "heading" && node.attrs?.level === 1) {
        title = node.content?.map((c) => c.text).join(" ") || "";
      } else if (node.type === "image" && node.attrs?.src) {
        content.push({ type: "image", src: node.attrs.src });
      } else if (node.type === "video" && node.attrs?.src) {
        content.push({ type: "video", src: node.attrs.src });
      } else {
        content.push(node);
      }
    });

    const structuredData = {
      title,
      content: content.length ? content : null,
    };

    try {
      const response = await onSave(structuredData);
      if (response?.message && window.confirm(response.message)) {
        editor.commands.clearContent(true);
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      Video,
      TextStyle,
      FontFamily,
    ],
    content: "<p>Hello World!</p>",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none text-gray-800 dark:text-gray-200 font-sans",
      },
    },
  });

  if (!user) return <NoUserAbout />;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-6">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {[
            {
              label: "B",
              command: () => editor.chain().focus().toggleBold().run(),
            },
            {
              label: "I",
              command: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              label: "S",
              command: () => editor.chain().focus().toggleStrike().run(),
            },
            {
              label: "</>",
              command: () => editor.chain().focus().toggleCode().run(),
            },
            { label: "🔗", command: handleAddLink },
            { label: "🖼️", command: handleImageUpload },
            { label: "🎥", command: handleVideoUpload },
            { label: "❌", command: removeSelectedMedia },
            { label: "↺", command: () => editor.chain().focus().undo().run() },
            { label: "↻", command: () => editor.chain().focus().redo().run() },
            {
              label: "HR",
              command: () => editor.chain().focus().setHorizontalRule().run(),
            },
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.command}
              className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-700 hover:bg-red-200 dark:hover:bg-gray-600 rounded-md transition"
            >
              {btn.label}
            </button>
          ))}

          <select
            onChange={applyFont}
            className="ml-auto px-3 py-1 text-sm bg-gray-100 dark:bg-red-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-white dark:bg-black min-h-[200px] transition-all">
          <EditorContent editor={editor} />
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleEditor}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Save Content
          </button>
        </div>
      </div>
    </>
  );
};

export default TipTap;
