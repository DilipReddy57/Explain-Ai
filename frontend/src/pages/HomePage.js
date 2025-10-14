import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Upload, BookOpen, Loader2 } from 'lucide-react';
import UploadDropzone from '../components/UploadDropzone';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [papers, setPapers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await axios.get(`${API}/papers`);
      setPapers(response.data);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadProgress(30);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/papers/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      toast.success('Paper uploaded successfully!');
      setUploadProgress(100);
      
      // Analyze paper
      toast.info('Analyzing paper...');
      const analysisResponse = await axios.post(`${API}/papers/${response.data.id}/analyze`);
      
      toast.success('Analysis complete!');
      
      // Navigate to workspace
      navigate(`/workspace/${response.data.id}`);
    } catch (error) {
      console.error('Error uploading paper:', error);
      toast.error('Error uploading paper. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePaperClick = (paperId) => {
    navigate(`/workspace/${paperId}`);
  };

  return (
    <main className="min-h-screen" style={{ background: 'hsl(210 40% 98%)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 -z-10 opacity-90" 
          style={{ background: 'linear-gradient(135deg, hsl(205 80% 98%) 0%, hsl(188 80% 94%) 40%, hsl(160 35% 92%) 100%)' }}
          aria-hidden
        />
        
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Header */}
          <div className="mb-10">
            <h1 
              className="font-['EB_Garamond',serif] text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-[-0.01em] mb-4 text-[hsl(210_15%_10%)]" 
              data-testid="hero-title"
            >
              ExplainAI Studio
            </h1>
            <p 
              className="font-[Figtree,ui-sans-serif,system-ui] text-sm md:text-base leading-7 text-[hsl(215_10%_40%)] max-w-2xl" 
              data-testid="hero-subtitle"
            >
              Understand AI/ML papers at your level — with evidence, visuals, and chat. Upload a paper to get multi-level explanations, evidence-backed summaries, and an Ask-Paper chat.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Upload Area */}
            <div>
              <UploadDropzone onFiles={handleFileUpload} disabled={uploading} />
              
              {uploading && (
                <Card className="mt-4 p-4" data-testid="upload-progress-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Processing paper...</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" data-testid="upload-progress-bar" />
                  <p className="text-xs text-muted-foreground mt-2">{uploadProgress}% complete</p>
                </Card>
              )}
            </div>

            {/* Recent Papers */}
            <Card className="p-6" data-testid="recent-papers-card">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-[Figtree] text-base md:text-lg font-semibold">Recent Papers</h2>
              </div>
              
              {papers.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center" data-testid="empty-papers-state">
                  <p>No papers uploaded yet.</p>
                  <p className="mt-1">Upload your first paper to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {papers.slice(0, 5).map((paper) => (
                    <div
                      key={paper.id}
                      onClick={() => handlePaperClick(paper.id)}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                      data-testid={`paper-item-${paper.id}`}
                    >
                      <h3 className="font-medium text-sm line-clamp-2">{paper.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{paper.total_pages} pages</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          paper.status === 'ready' ? 'bg-green-100 text-green-700' :
                          paper.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          paper.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {paper.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6" data-testid="feature-card-levels">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Multi-Level Explanations</h3>
              <p className="text-sm text-muted-foreground">Kid, Student, and Researcher perspectives tailored to your understanding level.</p>
            </Card>

            <Card className="p-6" data-testid="feature-card-evidence">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Evidence-Backed</h3>
              <p className="text-sm text-muted-foreground">Every claim linked to source chunks with page numbers and citations.</p>
            </Card>

            <Card className="p-6" data-testid="feature-card-chat">
              <div className="h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, hsl(188 80% 94%), hsl(160 35% 92%))' }}>
                <div className="h-full w-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Ask Paper Chat</h3>
              <p className="text-sm text-muted-foreground">Interactive Q&A to explore concepts and clarify doubts instantly.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;