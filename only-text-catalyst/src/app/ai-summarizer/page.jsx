'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Badge } from '@/components/badge'
import { RelatedTools } from '@/components/related-tools'
import { FAQSchema } from '@/components/faq-schema'
import { CheckCircleIcon, SparklesIcon, BoltIcon, DocumentTextIcon, AcademicCapIcon, ClipboardDocumentListIcon, VideoCameraIcon, LanguageIcon } from '@heroicons/react/20/solid'

export default function AISummarizerPage() {
  const [selectedLength, setSelectedLength] = useState('medium')
  const { toasts, showToast } = useToast()

  const faqs = [
    {
      question: "How does the AI summarizer work?",
      answer: "Our AI summarizer uses Claude Haiku 4.5 to analyze your text and extract the most important points. It can handle up to 50,000 characters and provides summaries in three lengths: short, medium, or long."
    },
    {
      question: "What types of content can I summarize?",
      answer: "You can summarize articles, research papers, documents, meeting notes, academic papers, blog posts, and any other text content. Perfect for lengthy content that needs quick understanding."
    },
    {
      question: "Is the summarizer free to use?",
      answer: "Yes! Our AI summarizer is completely free with no payment required. No signup, no subscription, no hidden fees."
    },
    {
      question: "How accurate are the summaries?",
      answer: "Our AI powered summarizer extracts key points with high accuracy, preserving the main ideas and essential information from your original text while creating concise summaries."
    },
    {
      question: "Can I use it for academic research?",
      answer: "Absolutely! The summarizer is perfect for academic research, helping you quickly extract key insights from research papers and academic papers. Great for study notes and literature reviews."
    },
    {
      question: "What's the character limit?",
      answer: "You can summarize up to 50,000 characters at once, which is roughly 10,000 words. Perfect for long articles and complex documents."
    }
  ]

  const lengths = [
    { id: 'short', name: 'Short', emoji: '📄', description: '1-2 sentences' },
    { id: 'medium', name: 'Medium', emoji: '📃', description: '3-5 sentences' },
    { id: 'long', name: 'Long', emoji: '📋', description: '1-2 paragraphs' },
  ]

  const handleSummarize = async (text) => {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length: selectedLength })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to summarize text')
    }

    return data.summary
  }

  const lengthSelector = (
    <div>
      <label className="mb-3 block text-sm font-medium">Summary Length</label>
      <div className="grid gap-3 sm:grid-cols-3">
        {lengths.map((length) => (
          <button
            key={length.id}
            onClick={() => setSelectedLength(length.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedLength === length.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                : 'border-zinc-200 hover:border-purple-300 dark:border-zinc-700'
            }`}
          >
            <div className="mb-2 text-2xl">{length.emoji}</div>
            <div className="font-semibold">{length.name}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{length.description}</div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <FAQSchema faqs={faqs} />
      <ToolLayout
        title="Essential AI Summarizer: Your Tool for Clear and Concise Insights"
        description="Free AI summarizer tool to extract key points from complex documents, lengthy content, and long text. Generate accurate summaries with bullet points, save time on academic research and meeting notes. AI powered summarization tool supports multiple languages."
        currentPath="/ai-summarizer"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Summarizer"
          placeholder="Paste your long text here to summarize it... (up to 50,000 characters)"
          actionLabel="Summarize"
          onTransform={handleSummarize}
          showToast={showToast}
          loadingText="Summarizing your text..."
          options={lengthSelector}
          demoText="Artificial intelligence has revolutionized many industries in recent years. From healthcare to finance, AI systems are being deployed to automate tasks, analyze data, and make predictions. Machine learning algorithms can now recognize patterns in vast datasets that would be impossible for humans to process manually. Natural language processing enables computers to understand and generate human language, powering applications like chatbots and translation services. Computer vision allows machines to interpret visual information, enabling self-driving cars and facial recognition systems. As AI technology continues to advance, it raises important questions about ethics, privacy, and the future of work. While AI offers tremendous potential benefits, it also presents challenges that society must address thoughtfully and proactively."
        />

        {/* Introduction Hero with Gradient */}
        <div className="relative isolate mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 px-6 py-16 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <Badge color="cyan">Free AI Summarizer</Badge>
              <Badge color="blue">AI Powered</Badge>
              <Badge color="indigo">Save Time</Badge>
            </div>
            
            <Heading level={2} className="mb-6 text-3xl font-bold">
              Introduction to AI Summarization
            </Heading>
            
            <Text className="mb-6 text-lg text-zinc-700 dark:text-zinc-300">
              Discover the power of AI summarizer tools to extract key points from complex documents, lengthy content, and long text. Our AI article summarizer can save time and effort in understanding valuable content, making it perfect for academic research, academic papers, and professional use.
            </Text>
            
            <Text className="mb-8 text-lg text-zinc-700 dark:text-zinc-300">
              Get introduced to the concept of AI generated summaries and the process of generating summaries. Our summarization tool helps you extract key points and main ideas from large texts with just one click, ensuring you never miss important information.
            </Text>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <SparklesIcon className="h-6 w-6 flex-none text-cyan-600 dark:text-cyan-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">AI Powered</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Extract key insights</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <BoltIcon className="h-6 w-6 flex-none text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Save Time</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Instant results</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <DocumentTextIcon className="h-6 w-6 flex-none text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Multiple Formats</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Bullet points & more</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <CheckCircleIcon className="h-6 w-6 flex-none text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Accurate Summary</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Key takeaways</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools - AI Powered & Basic Tools */}
        <RelatedTools currentPath="/ai-summarizer" />

        {/* Types of AI Summarization */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <Heading level={2} className="mb-6 text-3xl font-bold">
              Types of AI Summarization: Extractive vs. Abstractive
            </Heading>
            <Text className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              When exploring AI summarization together, we believe in understanding the two powerful approaches that can transform how you work with content: extractive and abstractive summarization. Together, we can discover how each method brings unique value to capturing the essential insights and core ideas from your content.
            </Text>
            
            <div className="space-y-6">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">Extractive Summarization</h3>
                <Text className="mb-4 text-zinc-600 dark:text-zinc-400">
                  Extractive summarization works alongside you by carefully scanning your original text and identifying the most valuable sentences and phrases. Your AI partner then compiles these key insights into a focused summary, often presented as clear bullet points or concise paragraphs. This collaborative approach ensures your summary stays true to your original voice and context—perfect when you want to preserve the authentic essence of lengthy documents, research papers, or meeting notes while saving precious time.
                </Text>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-green-600 dark:text-green-400" />
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    Best for: Academic papers, research papers, meeting notes, and documents where original context must be preserved
                  </Text>
                </div>
              </div>
              
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">Abstractive Summarization</h3>
                <Text className="mb-4 text-zinc-600 dark:text-zinc-400">
                  Abstractive summarization takes our partnership to the next level. Here, your AI collaborator reads and truly understands the context and main ideas of your text, then crafts an entirely new summary using fresh language. This approach allows us to create summaries that capture the heart of your content, even when the wording differs from your original text. Together, we can distill complex information into clear, accessible summaries that highlight your most valuable insights and core messages.
                </Text>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    Best for: Articles, long text, complex documents where you need concise summaries with key takeaways
                  </Text>
                </div>
              </div>
            </div>
            
            <Text className="mt-6 text-zinc-600 dark:text-zinc-400">
              By embracing both extractive and abstractive approaches together, we ensure you receive summaries that truly serve your unique needs—whether you prefer structured bullet points that honor your original text or more creative, condensed versions that focus on your core ideas. This flexible partnership makes summarization an essential ally for anyone looking to save time, extract key insights, and gain deeper understanding of complex materials.
            </Text>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} className="mb-4 text-3xl font-bold">Benefits of Using an AI Summarizer</Heading>
            <Text className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
              Our AI summarizer tool helps you reduce reading time, extract key insights, and stay updated with the latest information. Save time and improve comprehension with accurate summaries and essential information.
            </Text>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 transition-all hover:shadow-lg dark:from-cyan-900/20 dark:to-blue-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-cyan-100 p-3 dark:bg-cyan-900/50">
                <BoltIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Reduce Reading Time</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Stay updated with the latest information using our AI summarizer tool. Extract key insights and essential information from complex documents and lengthy content in seconds.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all hover:shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Extract Key Insights</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Get all the main points and key takeaways from your content. Our AI powered extract feature identifies core ideas and key sentences for easier understanding.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 transition-all hover:shadow-lg dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/50">
                <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Improve Comprehension</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Improve comprehension and retention of main points and key ideas with concise summaries. Never miss important information with accurate summary generation.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 transition-all hover:shadow-lg dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
                <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Enhance Productivity</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Enhance productivity and efficiency in research, study, and work with our AI powered summarizer. Perfect for academic research and study notes.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 transition-all hover:shadow-lg dark:from-pink-900/20 dark:to-rose-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3 dark:bg-pink-900/50">
                <DocumentTextIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Accurate Summaries</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Get an accurate summary that ensures you receive precise and reliable information from your content. Our tool supports generating summaries with key insights.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-red-50 p-6 transition-all hover:shadow-lg dark:from-rose-900/20 dark:to-red-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-rose-100 p-3 dark:bg-rose-900/50">
                <ClipboardDocumentListIcon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Avoid Missing Info</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Avoid missing important information with the help of our AI summarizer tool. Extract key points and essential information from lengthy content effortlessly.
              </Text>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Perfect For</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📰 Articles</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Summarize long articles and news stories
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📚 Research Papers</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Extract key findings from academic papers
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Email Threads</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Condense long email conversations
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Documents</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Create executive summaries of reports
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Meeting Notes</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Distill action items from long notes
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📖 Books</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get chapter summaries and overviews
              </p>
            </div>
          </div>
        </div>

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How long can the input text be?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                You can summarize up to 50,000 characters (approximately 10,000 words or 20 pages). This is much longer than most other summarizers!
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Does it work for technical content?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Claude Haiku 4.5 understands technical content, academic papers, and specialized topics. It preserves important technical details while creating concise summaries.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Can I adjust the summary length after generating it?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Simply select a different length (short, medium, or long) and click "Summarize" again. The AI will create a new summary at your chosen length.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Is the summary accurate?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Our AI is trained to capture key points accurately without adding information or changing meaning. It identifies the most important ideas and presents them clearly.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
