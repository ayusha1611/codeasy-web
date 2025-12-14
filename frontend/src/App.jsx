import { useState, useEffect, useRef } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";

/* -------------------- Typing Logo Component (FIXED) -------------------- */
function TypingLogo({ text = "CodEasy." }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayed((prev) => prev + text.charAt(indexRef.current));
        indexRef.current += 1;
        timeoutRef.current = setTimeout(type, 200);
      }
    };

    type();

    return () => clearTimeout(timeoutRef.current);
  }, [text]);

  return (
    <h1
      className="text-5xl font-extrabold text-[#007ACC] text-left"
      style={{
        textShadow: `
          -3px -3px 0 #ffffff,
           3px -3px 0 #ffffff,
          -3px  3px 0 #ffffff,
           3px  3px 0 #ffffff
        `,
      }}
    >
      {displayed}
      {displayed.length < text.length && (
        <span className="ml-1 animate-pulse text-white">|</span>
      )}
    </h1>
  );
}

/* -------------------- Main App -------------------- */
function App() {
  const [code, setCode] = useState(
    "// Upload your code file or paste your code here"
  );
  const [review, setReview] = useState(
    "*Review will be displayed here after you click on 'Review Code' button.*"
  );

  useEffect(() => {
    prism.highlightAll();
  }, []);
 const API_URL = import.meta.env.VITE_API_URL;

async function fetchReview() {
  const response = await axios.post(
    `${API_URL}/ai/get-review`,
    { code }
  );
  setReview(response.data);
}

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1996E6] text-white p-6 gap-6">
      {/* Header */}
      <header className="self-start mb-6">
        <TypingLogo text="//CodEasy." />
      </header>

      <div className="flex flex-row gap-9 w-full max-w-7xl items-start">
        {/* LEFT: Code Input */}
        <div className="w-1/2 bg-[#3C3C3C] p-6 rounded-lg shadow-lg border border-[#5A5A5A]">
          <input
            type="file"
            accept=".js,.py,.css,.cpp,.cs,.ts,.html,.json,.java"
            onChange={handleFileUpload}
            className="
    w-full
    mb-4
    text-sm
    text-white
    rounded-lg
    cursor-pointer
    bg-[#5A5A5A]
    p-2
    file:mr-4
    file:py-2
    file:px-4
    file:rounded-md
    file:border-0
    file:text-sm
    file:font-semibold
    file:bg-white
    file:text-black
    hover:file:bg-gray-200
  "
          />

          <div className="border border-gray-600 rounded-lg p-4 bg-[#252526]">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
              }}
            />
          </div>

          <button
            onClick={fetchReview}
            className="w-full py-3 mt-4 text-lg font-bold text-white bg-[#007ACC] hover:bg-[#005A9E] rounded-lg"
          >
            Review Code
          </button>
        </div>

        {/* RIGHT: Review Output */}
        <div className="w-1/2 bg-[#3C3C3C] p-6 rounded-lg shadow-lg border border-[#5A5A5A] overflow-hidden">
          <div className="prose prose-invert max-w-none break-words">
            <Markdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ ...props }) => (
                  <pre
                    {...props}
                    className="whitespace-pre-wrap break-words overflow-hidden"
                  />
                ),
                code: ({ ...props }) => (
                  <code
                    {...props}
                    className="whitespace-pre-wrap break-words"
                  />
                ),
              }}
            >
              {review}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
