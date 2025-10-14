import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  BookOpen, 
  Baby, 
  GraduationCap, 
  Microscope,
  Radio,
  FileText,
  Sparkles,
  Play
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
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-animate flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading paper...</p>
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
        <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
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
      <main className="container mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Explanations */}
          <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm text-muted-foreground">Generating multi-level explanations and insights</p>
              </Card>
            ) : (
              <>
                {/* Key Points */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-6 frosted-glass cyber-corner" data-testid="key-points-card">
                    <h2 className="font-orbitron text-2xl font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Key Insights
                    </h2>
                    <div className="space-y-4">
                      {analysis.key_points.problem && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                          <Badge variant="outline" className="mb-2 border-primary/50 text-primary">Problem</Badge>
                          <p className="text-sm">{analysis.key_points.problem}</p>
                        </div>
                      )}
                      {analysis.key_points.main_idea && (
                        <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                          <Badge variant="outline" className="mb-2 border-secondary/50 text-secondary">Main Idea</Badge>
                          <p className="text-sm">{analysis.key_points.main_idea}</p>
                        </div>
                      )}
                      {analysis.key_points.approach && (
                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                          <Badge variant="outline" className="mb-2 border-accent/50 text-accent">Approach</Badge>
                          <p className="text-sm">{analysis.key_points.approach}</p>
                        </div>
                      )}
                      {analysis.key_points.results && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                          <Badge variant="outline" className="mb-2 border-primary/50 text-primary">Results</Badge>
                          <p className="text-sm">{analysis.key_points.results}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                {/* Multi-Level Explanations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="p-6 frosted-glass" data-testid="explanations-card">
                    <Tabs defaultValue="student" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                        <TabsTrigger value="kid" data-testid="tab-kid" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          <Baby className="h-4 w-4 mr-2" />
                          Kid
                        </TabsTrigger>
                        <TabsTrigger value="student" data-testid="tab-student" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Student
                        </TabsTrigger>
                        <TabsTrigger value="researcher" data-testid="tab-researcher" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                          <Microscope className="h-4 w-4 mr-2" />
                          Researcher
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="kid" className="mt-6" data-testid="panel-kid">
                        <div className="prose prose-sm max-w-none text-foreground">
                          <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.kid_explanation}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="student" className="mt-6" data-testid="panel-student">
                        <div className="prose prose-sm max-w-none text-foreground">
                          <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.student_explanation}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="researcher" className="mt-6" data-testid="panel-researcher">
                        <div className="prose prose-sm max-w-none text-foreground">
                          <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.researcher_explanation}</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>

                {/* Podcast & PPT */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Podcast Script */}
                  {analysis.podcast_script && (
                    <Card className="p-6 frosted-glass" data-testid="podcast-card">
                      <div className="flex items-center gap-2 mb-4">
                        <Radio className="h-5 w-5 text-secondary" />
                        <h3 className="font-orbitron font-semibold text-lg">Podcast Script</h3>
                      </div>
                      <ScrollArea className="h-64">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {analysis.podcast_script}
                        </p>
                      </ScrollArea>
                      <Button className="w-full mt-4 cyber-button" variant="secondary" data-testid="play-podcast-button">
                        <Play className="h-4 w-4 mr-2" />
                        Generate Audio
                      </Button>
                    </Card>
                  )}

                  {/* PPT Slides */}
                  {analysis.ppt_slides && analysis.ppt_slides.length > 0 && (
                    <Card className="p-6 frosted-glass" data-testid="ppt-card">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-accent" />
                        <h3 className="font-orbitron font-semibold text-lg">Presentation</h3>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {analysis.ppt_slides.map((slide, idx) => (
                          <AccordionItem key={idx} value={`slide-${idx}`}>
                            <AccordionTrigger className="text-sm font-semibold">
                              Slide {slide.slide}: {slide.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                {slide.bullets && slide.bullets.map((bullet, bidx) => (
                                  <li key={bidx}>{bullet}</li>
                                ))}
                              </ul>
                              {slide.visual && (
                                <p className="mt-3 text-xs text-muted-foreground italic">
                                  Visual: {slide.visual}
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </Card>
                  )}
                </motion.div>

                {/* Glossary */}
                {analysis.glossary && analysis.glossary.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card className="p-6 frosted-glass" data-testid="glossary-card">
                      <h2 className="font-orbitron text-xl font-bold mb-4">Glossary</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.glossary.map((term, idx) => (
                          <HoverCard key={idx} openDelay={120}>
                            <HoverCardTrigger asChild>
                              <div 
                                className="p-3 rounded-lg border border-border bg-muted/20 cursor-help hover:border-primary/50 transition-colors" 
                                data-testid={`glossary-term-${idx}`}
                              >
                                <span className="font-semibold text-sm text-primary">{term.term}</span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="max-w-sm frosted-glass" data-testid={`glossary-definition-${idx}`}>
                              <p className="text-sm">{term.definition}</p>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-[calc(100vh-200px)] flex flex-col frosted-glass sticky top-24" data-testid="chat-card">
              <h2 className="font-orbitron text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Ask Paper AI
              </h2>

              <ScrollArea className="flex-1 pr-4 mb-4" data-testid="chat-log">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-12" data-testid="chat-empty-state">
                    <div className="inline-block p-4 rounded-full bg-primary/20 mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Ask me anything about this paper...</p>
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
                              ? 'bg-primary/20 border border-primary/50 ml-8'
                              : 'bg-muted/50 border border-border mr-8'
                          }`}
                          data-testid={`chat-message-${idx}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {chatLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-muted-foreground p-4" 
                        data-testid="chat-loading"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-end gap-2" data-testid="chat-input-area">
                <Textarea
                  rows={2}
                  placeholder="Ask about the paper..."
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
      </main>
    </div>
  );
};

export default WorkspacePage;