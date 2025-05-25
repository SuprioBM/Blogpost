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
    return {
      src: { default: null },
    };
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
         const font = event.target.value
         editor.chain().focus().setFontFamily(font).run();
       };
  const handleAddLink = () => {
    if (!editor) return;

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

  
  // Handle multiple image uploads
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className ="width-50px height-50px"
    input.multiple = true; // Allow multiple file selection
    input.onchange = (event) => {
      if (!editor) return;
      const files = event.target.files;
      if (!files) return;

      // To hold all images to be inserted
      let imagesToInsert = [];

      Array.from(files).forEach((file) => {
        const imgURL = URL.createObjectURL(file);
        imagesToInsert.push(`<img src="${imgURL}" />`); // Collecting all image URLs
      });

      // Once all images are collected, insert them all at once
      if (imagesToInsert.length > 0) {
        // We are using .insertContentAt to insert images at the current cursor position
        editor
          .chain()
          .focus() // Ensure the editor is focused
          .insertContentAt(
            editor.state.selection.$anchor.pos,
            imagesToInsert.join("")
          ) // Insert images at current position
          .run();
      }
    };
    input.click();
  };

const handleVideoUpload = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";
  input.multiple = true; // Allow multiple video selection
  input.onchange = (event) => {
    if (!editor) return;
    const files = event.target.files;
    if (!files) return;

    // To hold all videos to be inserted
    let videosToInsert = [];

    Array.from(files).forEach((file) => {
      const videoURL = URL.createObjectURL(file);
      videosToInsert.push(`<video controls src="${videoURL}"></video>`); // Collecting all video URLs
    });

    // Once all videos are collected, insert them all at once
    if (videosToInsert.length > 0) {
      editor
        .chain()
        .focus()
        .insertContentAt(
          editor.state.selection.$anchor.pos,
          videosToInsert.join("")
        )
        .run();
    }
  };
  input.click();
};



  
  // Handle editor save
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





// Remove selected media (image or video)
  const removeSelectedMedia = () => {
    if (editor) {
      editor.chain().focus().deleteSelection().run();
    }
  };
  // In your component
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, Image, Video,TextStyle,FontFamily],
    content: "<p>Hello World!</p>",
    onUpdate: ({ editor }) => {},
  });
  
  
  return (
    <>
    {user ? (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
          />
        <div className="control-group">
          <div className="button-group flex flex-row flex-wrap gap-1 py-5 m-2  round ">
            <button onClick={() => editor.chain().focus().toggleBold().run()}>
              <strong>B</strong>
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>
              <strong>I</strong>
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()}>
              <strong>Strike</strong>
            </button>
            <button onClick={() => editor.chain().focus().toggleCode().run()}>
              <strong>Code</strong>
            </button>
       
    
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={editor?.isActive("paragraph") ? "is-active" : ""}
              >
              <strong>P</strong>
            </button>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level }).run()
                }
                className={
                  editor?.isActive("heading", { level }) ? "is-active" : ""
                }
                >
                <strong>H{level}</strong>
              </button>
            ))}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor?.isActive("bulletList") ? "is-active" : ""}
            >
              <strong>Bullet List</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive("orderedList") ? "is-active" : ""}
            >
              <strong>Ordered List</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor?.isActive("codeBlock") ? "is-active" : ""}
            >
              <strong>Code Block</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "is-active" : ""}
              >
              <strong>underline</strong>
            </button>
        
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
              <strong>HL</strong>
            </button>
            <label>
              Fonts:
              <select  onChange={applyFont} className="ml-2">
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>

            <button onClick={() => editor.chain().focus().setHardBreak().run()}>
              <strong>Hard Break</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor?.can().chain().focus().undo().run()}
            >
              <strong>Undo</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor?.can().chain().focus().redo().run()}
              >
              <strong>Redo</strong>
            </button>

            {/* Add Image Button */}
            <button onClick={handleImageUpload}>🖼️</button>

            {/* Add Video Button */}
            <button onClick={handleVideoUpload}>🎥</button>

            {/* Remove Selected Media Button */}
            <button onClick={removeSelectedMedia}>
              ❌
            </button>
            <button onClick={handleAddLink}>🔗</button>
          </div>
        </div>

        <div
          className="editor-container"
          style={{
            border: "1px solid #ccc",
            minHeight: "200px",
            padding: "10px",
          }}
          >
          <EditorContent className="tiptap" editor={editor} />
        </div>

        <button className="mt-5" onClick={() => handleEditor()}>
          Save
        </button>
      </>
    ) : (
      < NoUserAbout />
    ) }
    </>
  );
};

export default TipTap;
