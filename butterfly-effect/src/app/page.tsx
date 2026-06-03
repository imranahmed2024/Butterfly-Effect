'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface TimelineEvent {
  year: string;
  realHistory: string;
  alternateHistory: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [realHistory, setRealHistory] = useState('');
  const [alternateHistory, setAlternateHistory] = useState('');
  const [error, setError] = useState('');

  const fetchWikipediaContext = async (searchTerm: string): Promise<string> => {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&exintro&explaintext&inprop=url&titles=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1') {
        return `No Wikipedia article found for "${searchTerm}". Using general knowledge about ${searchTerm}.`;
      }
      
      return pages[pageId].extract || '';
    } catch (err) {
      console.error('Wikipedia API error:', err);
      return `Failed to fetch historical context. Proceeding with general knowledge about ${searchTerm}.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a "what if" scenario');
      return;
    }

    setIsLoading(true);
    setError('');
    setRealHistory('');
    setAlternateHistory('');

    try {
      // Step 1: Fetch real historical context from Wikipedia
      const wikipediaContext = await fetchWikipediaContext(query);
      setRealHistory(wikipediaContext);

      // Step 2: Call our API to generate alternate history
      const response = await axios.post('/api/generate', {
        historicalContext: wikipediaContext,
        divergence: query,
      }, {
        responseType: 'text',
      });

      setAlternateHistory(response.data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to generate alternate history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
            🦋 Butterfly Effect
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The Counterfactual History Engine. Explore alternate timelines by changing one moment in history.
          </p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What if... the Library of Alexandria never burned?"
                className="w-full px-6 py-4 text-lg bg-gray-800/50 border border-purple-500/30 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 backdrop-blur-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Simulating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Timeline</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                ⚠️ {error}
              </div>
            )}
          </div>
        </form>

        {/* Results Section */}
        {(realHistory || alternateHistory || isLoading) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Real History Panel */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span>📚</span> Real History
              </h2>
              <div className="prose prose-invert max-w-none">
                {realHistory ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {realHistory}
                  </div>
                ) : isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-4/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/6"></div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Alternate History Panel */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <span>🌀</span> Alternate Timeline
              </h2>
              <div className="prose prose-invert max-w-none">
                {alternateHistory ? (
                  <ReactMarkdown
                    components={{
                      h3: ({node, ...props}) => (
                        <h3 className="text-xl font-bold text-pink-400 mt-6 mb-3 border-b border-purple-500/30 pb-2" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="text-gray-300 leading-relaxed mb-4" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="text-purple-300 font-semibold" {...props} />
                      ),
                    }}
                  >
                    {alternateHistory}
                  </ReactMarkdown>
                ) : isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-4/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/6"></div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with Next.js • Powered by AI • Historical data from Wikipedia</p>
          <p className="mt-2">Explore the infinite possibilities of what could have been.</p>
        </footer>
      </div>
    </main>
  );
}
