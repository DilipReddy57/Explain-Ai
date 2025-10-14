import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Sparkles,
  Radio,
  FileText,
  Download,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkspacePage = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('student');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPaperAndAnalysis();
  }, [paperId]);

  const fetchPaperAndAnalysis = async () => {
    try {
      const [paperRes, analysisRes] = await Promise.all([
        axios.get(`${API}/papers/${paperId}`),
        axios.get(`${API}/papers/${paperId}/analysis`).catch(() => null),
      ]);

      setPaper(paperRes.data);
      if (analysisRes) {
        setAnalysis(analysisRes.data);
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast.error('Error loading paper');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await axios.post(
        `${API}/papers/${paperId}/chat?question=${encodeURIComponent(userMessage)}`
      );

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.answer },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error getting response');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      const response = await axios.post(`${API}/papers/${paperId}/generate-audio`);
      toast.success('Audio generation ready! Using browser text-to-speech.');
      
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(analysis.podcast_script);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        toast.error('Text-to-speech not supported in your browser');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Error generating audio');
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const downloadPPT = () => {
    if (!analysis || !analysis.ppt_slides) return;
    
    // Create a simple text version of the presentation
    let pptText = `PRESENTATION: ${paper.title}\n\n`;
    pptText += '='.repeat(50) + '\n\n';
    
    analysis.ppt_slides.forEach((slide, idx) => {
      pptText += `SLIDE ${slide.slide}: ${slide.title}\n`;
      pptText += '-'.repeat(30) + '\n';
      if (slide.points) {
        slide.points.forEach(point => {
          pptText += `• ${point}\n`;
        });
      }
      if (slide.visual_note) {
        pptText += `\nVisual: ${slide.visual_note}\n`;
      }
      pptText += '\n';
    });
    
    const blob = new Blob([pptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.substring(0, 30)}_presentation.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Presentation downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-animate flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">AI is analyzing your paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen gradient-animate flex items-center justify-center" data-testid="error-state">
        <div className="text-center">
          <p className="text-lg mb-4">Paper not found</p>
          <Button onClick={() => navigate('/')} data-testid="back-home-button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-animate grid-overlay" data-testid="workspace-page">
      {/* Header */}
      <header className="border-b border-border/50 frosted-glass backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="cyber-button"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="font-orbitron text-xl md:text-2xl font-bold line-clamp-1 neon-text" data-testid="paper-title">
                {paper.title}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="border-primary/50">{paper.total_pages} pages</Badge>
                <span>•</span>
                <span>{paper.filename}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 py-8">
        {!analysis ? (
          <Card className="p-12 text-center frosted-glass" data-testid="no-analysis-card">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <p className="text-lg font-semibold mb-2">AI Analysis in Progress...</p>
            <p className="text-sm text-muted-foreground">Generating explanations, visuals, and insights</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Quick Actions */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-6 frosted-glass" data-testid="quick-actions">
                <h3 className="font-orbitron font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  {/* Audio Generation */}
                  <Button 
                    onClick={isPlayingAudio ? stopAudio : handleGenerateAudio}
                    className="w-full cyber-button justify-start"
                    variant="secondary"
                    disabled={!analysis.podcast_script}
                    data-testid="generate-audio-button"
                  >
                    {isPlayingAudio ? (
                      <><Pause className="h-4 w-4 mr-2" /> Stop Audio</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" /> Play Podcast</>
                    )}
                  </Button>
                  
                  {/* Download PPT */}
                  <Button 
                    onClick={downloadPPT}
                    className="w-full cyber-button justify-start"
                    variant="outline"
                    disabled={!analysis.ppt_slides}
                    data-testid="download-ppt-button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Slides
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {/* Level Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Explanation Level</label>
                  <select 
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm"
                    data-testid="level-selector"
                  >
                    <option value="kid">👶 Kid-Friendly</option>
                    <option value="student">🎓 Student Level</option>
                    <option value="researcher">🔬 Researcher</option>
                  </select>
                </div>
              </Card>
              
              {/* Visual Concepts */}
              {analysis.visual_concepts && analysis.visual_concepts.length > 0 && (
                <Card className="p-6 frosted-glass" data-testid="visual-concepts-sidebar">
                  <h3 className="font-orbitron font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-secondary" />
                    Key Concepts
                  </h3>
                  <div className="space-y-3">
                    {analysis.visual_concepts.slice(0, 3).map((concept, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-semibold text-primary mb-1">{concept.concept}</p>
                        <p className="text-muted-foreground text-xs">{concept.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Points */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 frosted-glass" data-testid="key-points-card">
                  <h2 className="font-orbitron text-2xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Research Overview
                  </h2>
                  <div className="space-y-6">
                    {analysis.key_points.problem && (
                      <div>
                        <Badge variant="outline" className="mb-3 border-primary/50 text-primary">Challenge</Badge>
                        <p className="text-foreground leading-relaxed">{analysis.key_points.problem}</p>
                      </div>
                    )}
                    {analysis.key_points.main_idea && (
                      <div>
                        <Badge variant="outline" className="mb-3 border-secondary/50 text-secondary">Innovation</Badge>
                        <p className="text-foreground leading-relaxed">{analysis.key_points.main_idea}</p>
                      </div>
                    )}
                    {analysis.key_points.results && (
                      <div>
                        <Badge variant="outline" className="mb-3 border-accent/50 text-accent">Outcomes</Badge>
                        <p className="text-foreground leading-relaxed">{analysis.key_points.results}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Architecture Diagram */}
              {analysis.architecture_diagram && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="p-6 frosted-glass" data-testid="architecture-card">
                    <h3 className="font-orbitron font-semibold mb-4">System Architecture</h3>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img 
                        src={analysis.architecture_diagram} 
                        alt="Architecture Diagram" 
                        className="w-full"
                        data-testid="architecture-diagram"
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 frosted-glass" data-testid="explanation-card">
                  <h3 className="font-orbitron font-semibold mb-4">Detailed Explanation</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {analysis[`${selectedLevel}_explanation`]}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Visual Concepts Grid */}
              {analysis.visual_concepts && analysis.visual_concepts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="p-6 frosted-glass" data-testid="visual-concepts-card">
                    <h3 className="font-orbitron font-semibold mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Visual Concepts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.visual_concepts.map((concept, idx) => (
                        <div key={idx} className="space-y-2" data-testid={`visual-concept-${idx}`}>
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img 
                              src={concept.image_data} 
                              alt={concept.concept}
                              className="w-full"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">{concept.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Podcast & PPT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Podcast Script */}
                {analysis.podcast_script && (
                  <Card className="p-6 frosted-glass" data-testid="podcast-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-secondary" />
                        <h3 className="font-orbitron font-semibold">Podcast</h3>
                      </div>
                      <Badge variant="outline">
                        {Math.ceil(analysis.podcast_script.split(' ').length / 150)} min
                      </Badge>
                    </div>
                    <ScrollArea className="h-64">
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {analysis.podcast_script}
                      </p>
                    </ScrollArea>
                  </Card>
                )}

                {/* PPT Slides */}
                {analysis.ppt_slides && analysis.ppt_slides.length > 0 && (
                  <Card className="p-6 frosted-glass" data-testid="ppt-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <h3 className="font-orbitron font-semibold">Slides</h3>
                      </div>
                      <Badge variant="outline">{analysis.ppt_slides.length} slides</Badge>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {analysis.ppt_slides.map((slide, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/20 border border-border">
                            <p className="font-semibold text-sm mb-2">
                              {slide.slide}. {slide.title}
                            </p>
                            {slide.points && (
                              <ul className="space-y-1 text-xs text-muted-foreground">
                                {slide.points.map((point, pidx) => (
                                  <li key={pidx}>• {point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                )}
              </div>

              {/* Glossary */}
              {analysis.glossary && analysis.glossary.length > 0 && (
                <Card className="p-6 frosted-glass" data-testid="glossary-card">
                  <h3 className="font-orbitron font-semibold mb-4">Technical Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.glossary.map((term, idx) => (
                      <HoverCard key={idx} openDelay={120}>
                        <HoverCardTrigger asChild>
                          <div 
                            className="p-3 rounded-lg border border-border bg-muted/10 cursor-help hover:border-primary/50 transition-colors" 
                            data-testid={`glossary-term-${idx}`}
                          >
                            <span className="font-semibold text-sm text-primary">{term.term}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="max-w-sm frosted-glass" data-testid={`glossary-definition-${idx}`}>
                          <p className="text-sm text-foreground">{term.definition}</p>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Chat */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-[calc(100vh-200px)] flex flex-col frosted-glass sticky top-24" data-testid="chat-card">
                <h3 className="font-orbitron font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Ask AI
                </h3>

                <ScrollArea className="flex-1 pr-4 mb-4" data-testid="chat-log">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-12" data-testid="chat-empty-state">
                      <div className="inline-block p-4 rounded-full bg-primary/20 mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Ask anything about this paper</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {chatHistory.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-primary/20 border border-primary/50'
                                : 'bg-muted/50 border border-border'
                            }`}
                            data-testid={`chat-message-${idx}`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {chatLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground p-4" data-testid="chat-loading">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex items-end gap-2" data-testid="chat-input-area">
                  <Textarea
                    rows={2}
                    placeholder="Ask about concepts..."
                    className="flex-1 resize-none bg-muted/50 border-border focus:border-primary"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={chatLoading}
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatMessage.trim()}
                    className="cyber-button"
                    data-testid="chat-send-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;