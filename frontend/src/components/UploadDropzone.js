import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

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
    <Card
      className={`p-8 border-dashed border-2 transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      {...getRootProps()}
      data-testid="upload-dropzone"
    >
      <input {...getInputProps()} data-testid="upload-input" />
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium text-lg mb-1">
            {isDragActive ? 'Drop the PDF here' : 'Upload PDF or arXiv URL'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to browse
          </p>
        </div>
        {!disabled && (
          <Button variant="secondary" type="button" data-testid="browse-files-button">
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        )}
        <div className="text-xs text-muted-foreground">
          PDF only, max 25MB
        </div>
      </div>
    </Card>
  );
};

export default UploadDropzone;