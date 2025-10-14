import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Upload, BookOpen, Loader2, Sparkles, Zap, Radio, FileText } from 'lucide-react';
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
      toast.info('AI is analyzing your paper...');
      const analysisResponse = await axios.post(`${API}/papers/${response.data.id}/analyze`);
      
      toast.success('Analysis complete! 🎉');
      
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
    <main className="min-h-screen gradient-animate grid-overlay relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl top-1/2 right-0 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <Badge className="px-4 py-1 bg-primary/20 border-primary/50 text-primary neon-border" data-testid="beta-badge">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              AI-Powered Research Assistant
            </Badge>
          </div>
          <h1 
            className="font-orbitron text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 neon-text" 
            data-testid="hero-title"
          >
            ExplainAI Studio
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" 
            data-testid="hero-subtitle"
          >
            Transform complex AI research papers into multi-level explanations, podcasts, and presentations.
            <span className="block mt-2 text-primary font-semibold">Powered by Advanced AI</span>
          </p>
        </motion.div>

        {/* Main Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <UploadDropzone onFiles={handleFileUpload} disabled={uploading} />
          
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mt-6 p-6 frosted-glass" data-testid="upload-progress-card">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-semibold">AI Processing Pipeline Active...</span>
                </div>
                <Progress value={uploadProgress} className="h-3 mb-2" data-testid="upload-progress-bar" />
                <p className="text-sm text-muted-foreground">{uploadProgress}% • Extracting insights and generating multi-level explanations</p>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 holo-card" data-testid="feature-card-levels">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20 neon-border">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Multi-Level</h3>
              </div>
              <p className="text-sm text-muted-foreground">Kid, Student & Researcher explanations tailored to any level.</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 holo-card" data-testid="feature-card-podcast">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-secondary/20 border border-secondary/50">
                  <Radio className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Podcast</h3>
              </div>
              <p className="text-sm text-muted-foreground">Convert papers into engaging audio podcast scripts.</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6 holo-card" data-testid="feature-card-ppt">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-accent/20 border border-accent/50">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">Presentations</h3>
              </div>
              <p className="text-sm text-muted-foreground">Auto-generate PPT slides with visual suggestions.</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="p-6 holo-card" data-testid="feature-card-chat">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20 neon-border">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Ask Paper</h3>
              </div>
              <p className="text-sm text-muted-foreground">Interactive AI chat to explore concepts instantly.</p>
            </Card>
          </motion.div>
        </div>

        {/* Recent Papers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="p-8 frosted-glass" data-testid="recent-papers-card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-orbitron text-2xl font-bold">Recent Papers</h2>
              <Badge className="ml-auto" variant="outline">{papers.length}</Badge>
            </div>
            
            {papers.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-papers-state">
                <div className="inline-block p-4 rounded-full bg-muted/50 mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No papers uploaded yet.</p>
                <p className="text-sm text-muted-foreground">Upload your first research paper to begin!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {papers.slice(0, 6).map((paper, idx) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    onClick={() => handlePaperClick(paper.id)}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 cursor-pointer transition-all duration-300 cyber-corner"
                    data-testid={`paper-item-${paper.id}`}
                  >
                    <h3 className="font-semibold text-sm line-clamp-2 mb-3">{paper.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{paper.total_pages} pages</span>
                      <span>•</span>
                      <Badge 
                        className={`text-xs ${
                          paper.status === 'ready' ? 'bg-secondary/20 text-secondary border-secondary/50' :
                          paper.status === 'processing' ? 'bg-primary/20 text-primary border-primary/50' :
                          paper.status === 'error' ? 'bg-destructive/20 text-destructive border-destructive/50' :
                          'bg-muted text-muted-foreground'
                        }`}
                        variant="outline"
                      >
                        {paper.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default HomePage;