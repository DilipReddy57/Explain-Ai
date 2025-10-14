import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2, BookOpen } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="error-state">
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
    <div className="min-h-screen bg-background" data-testid="workspace-page">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="font-['EB_Garamond',serif] text-xl md:text-2xl font-semibold line-clamp-1" data-testid="paper-title">
                {paper.title}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{paper.total_pages} pages</span>
                <span>•</span>
                <span>{paper.filename}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Explanations */}
          <div className="lg:col-span-2 space-y-6">
            {!analysis ? (
              <Card className="p-8 text-center" data-testid="no-analysis-card">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Analysis in progress...</p>
                <p className="text-sm text-muted-foreground">Please wait while we analyze this paper.</p>
              </Card>
            ) : (
              <>
                {/* Key Points */}
                <Card className="p-6" data-testid="key-points-card">
                  <h2 className="font-['EB_Garamond',serif] text-xl font-semibold mb-4">Key Points</h2>
                  <div className="space-y-3">
                    {analysis.key_points.problem && (
                      <div>
                        <Badge variant="outline" className="mb-1">Problem</Badge>
                        <p className="text-sm">{analysis.key_points.problem}</p>
                      </div>
                    )}
                    {analysis.key_points.main_idea && (
                      <div>
                        <Badge variant="outline" className="mb-1">Main Idea</Badge>
                        <p className="text-sm">{analysis.key_points.main_idea}</p>
                      </div>
                    )}
                    {analysis.key_points.approach && (
                      <div>
                        <Badge variant="outline" className="mb-1">Approach</Badge>
                        <p className="text-sm">{analysis.key_points.approach}</p>
                      </div>
                    )}
                    {analysis.key_points.results && (
                      <div>
                        <Badge variant="outline" className="mb-1">Results</Badge>
                        <p className="text-sm">{analysis.key_points.results}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Multi-Level Explanations */}
                <Card className="p-6" data-testid="explanations-card">
                  <Tabs defaultValue="student" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="kid" data-testid="tab-kid">👶 Kid</TabsTrigger>
                      <TabsTrigger value="student" data-testid="tab-student">🎓 Student</TabsTrigger>
                      <TabsTrigger value="researcher" data-testid="tab-researcher">🔬 Researcher</TabsTrigger>
                    </TabsList>
                    <TabsContent value="kid" className="mt-4" data-testid="panel-kid">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.kid_explanation}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="student" className="mt-4" data-testid="panel-student">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.student_explanation}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="researcher" className="mt-4" data-testid="panel-researcher">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-7 whitespace-pre-wrap">{analysis.researcher_explanation}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Glossary */}
                {analysis.glossary && analysis.glossary.length > 0 && (
                  <Card className="p-6" data-testid="glossary-card">
                    <h2 className="font-['EB_Garamond',serif] text-xl font-semibold mb-4">Glossary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.glossary.map((term, idx) => (
                        <HoverCard key={idx} openDelay={120}>
                          <HoverCardTrigger asChild>
                            <div 
                              className="p-3 rounded-lg border bg-muted/50 cursor-help" 
                              data-testid={`glossary-term-${idx}`}
                            >
                              <span className="font-medium text-sm text-primary">{term.term}</span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="max-w-sm" data-testid={`glossary-definition-${idx}`}>
                            <p className="text-sm">{term.definition}</p>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <Card className="p-4 h-[calc(100vh-200px)] flex flex-col" data-testid="chat-card">
              <h2 className="font-['EB_Garamond',serif] text-lg font-semibold mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Ask Paper
              </h2>

              <ScrollArea className="flex-1 pr-4" data-testid="chat-log">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8" data-testid="chat-empty-state">
                    <p className="text-sm text-muted-foreground">Ask questions about this paper...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-8'
                            : 'bg-muted mr-8'
                        }`}
                        data-testid={`chat-message-${idx}`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground" data-testid="chat-loading">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-end gap-2 mt-4" data-testid="chat-input-area">
                <Textarea
                  rows={2}
                  placeholder="Ask the paper..."
                  className="flex-1 resize-none"
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