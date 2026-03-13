import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

const languageDefaults = {
  javascript: `// Write your solution in JavaScript\nfunction solve() {\n  // ...\n}\n`,
  python: '# Write your solution in Python\ndef solve():\n    pass\n',
  cpp: '// Write your solution in C++\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
  java: '// Write your solution in Java\nclass Main {\n  public static void main(String[] args) {\n  }\n}\n'
};

function CodeEditor({ language, value, onChange, readOnly = false, title }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: value || languageDefaults[language] || '',
      language,
      theme: 'vs-dark',
      automaticLayout: true,
      readOnly,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false
    });

    const sub = editorRef.current.onDidChangeModelContent(() => {
      if (!readOnly) {
        onChange?.(editorRef.current.getValue());
      }
    });

    return () => {
      sub.dispose();
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && language) {
      monaco.editor.setModelLanguage(editorRef.current.getModel(), language);
    }
  }, [language]);

  useEffect(() => {
    if (editorRef.current && typeof value === 'string' && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="px-3 py-1.5 text-xs font-medium text-slate-300 border-b border-slate-700 bg-slate-900/40">
          {title}
        </div>
      )}
      <div ref={containerRef} className="flex-1 min-h-[260px]" />
    </div>
  );
}

export default CodeEditor;

