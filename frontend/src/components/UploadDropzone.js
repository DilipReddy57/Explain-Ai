import React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileUp } from 'lucide-react';

const UploadDropzone = ({ onFiles, disabled }) => {
  const onDrop = React.useCallback(
    (acceptedFiles) => {
      if (onFiles) {
        onFiles(acceptedFiles);
      }
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
  });

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card
        className={`p-12 border-2 border-dashed transition-all duration-300 frosted-glass scan-effect ${
          isDragActive
            ? 'border-primary bg-primary/10 neon-border'
            : 'border-border hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        {...getRootProps()}
        data-testid="upload-dropzone"
      >
        <input {...getInputProps()} data-testid="upload-input" />
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <motion.div
            animate={{
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl bg-primary/20 neon-border pulse-glow"
          >
            {isDragActive ? (
              <FileUp className="h-12 w-12 text-primary" />
            ) : (
              <Upload className="h-12 w-12 text-primary" />
            )}
          </motion.div>
          <div>
            <p className="font-orbitron font-semibold text-xl mb-2 neon-text">
              {isDragActive ? 'Drop PDF Here' : 'Upload Research Paper'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop your PDF or click to browse
            </p>
          </div>
          {!disabled && (
            <Button 
              variant="secondary" 
              size="lg"
              type="button" 
              className="cyber-button font-semibold"
              data-testid="browse-files-button"
            >
              <Upload className="mr-2 h-5 w-5" />
              Select File
            </Button>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-muted/50 border border-border">PDF only</span>
            <span className="px-3 py-1 rounded-full bg-muted/50 border border-border">Max 25MB</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default UploadDropzone;