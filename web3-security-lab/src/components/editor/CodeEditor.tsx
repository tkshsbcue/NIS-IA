import { useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { useCompiler } from '@/hooks/useCompiler';
import { getLevelById } from '@/levels';

export function CodeEditor() {
  const {
    editorCode,
    setEditorCode,
    currentLevelId,
    compilationResult,
    addConsoleMessage,
  } = useStore();
  const { compile } = useCompiler();

  const level = getLevelById(currentLevelId);

  // Initialize editor with vulnerable contract code when level changes
  useEffect(() => {
    if (level && !editorCode) {
      setEditorCode(level.vulnerableContract);
    }
  }, [level, editorCode, setEditorCode]);

  const handleCompile = useCallback(async () => {
    await compile(editorCode);
  }, [compile, editorCode]);

  const handleDeploy = useCallback(() => {
    addConsoleMessage({
      type: 'info',
      message: 'Deploy requires a connected wallet on Sepolia. Compile first, then deploy.',
    });
  }, [addConsoleMessage]);

  const handleReset = useCallback(() => {
    if (level) {
      setEditorCode(level.vulnerableContract);
      addConsoleMessage({ type: 'info', message: 'Editor reset to original contract code.' });
    }
  }, [level, setEditorCode, addConsoleMessage]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-bg-secondary px-3 py-2">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleCompile}>
            <Play className="h-3.5 w-3.5" />
            Compile
          </Button>
          <Button size="sm" variant="outline" onClick={handleDeploy}>
            <Upload className="h-3.5 w-3.5" />
            Deploy
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {compilationResult && (
          <div className="flex items-center gap-2">
            {compilationResult.success ? (
              <Badge variant="success">Compiled</Badge>
            ) : (
              <Badge variant="danger">
                {compilationResult.errors.length} error{compilationResult.errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {compilationResult.warnings.length > 0 && (
              <Badge variant="warning">
                {compilationResult.warnings.length} warning{compilationResult.warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="sol"
          language="sol"
          theme="vs-dark"
          value={editorCode}
          onChange={(value) => setEditorCode(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12 },
            renderLineHighlight: 'gutter',
          }}
        />
      </div>
    </div>
  );
}
