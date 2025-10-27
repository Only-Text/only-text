'use client'

import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Badge } from '@/components/badge'
import { RelatedTools } from '@/components/related-tools'
import { FAQSchema } from '@/components/faq-schema'
import { SoftwareApplicationSchema } from '@/components/software-schema'
import { CheckCircleIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, DocumentTextIcon, AcademicCapIcon, PencilSquareIcon, LightBulbIcon } from '@heroicons/react/20/solid'

export default function AITextImproverPage() {
  const { toasts, showToast } = useToast()

  const toolInfo = {
    name: "AI Text Improver",
    description: "Free AI text improver for enhancing written content with advanced AI. Improve clarity, rewrite paragraphs, fix punctuation errors. Perfect for academic writing and professional content.",
    features: [
      "Text clarity enhancement",
      "Grammar and punctuation fixes",
      "Sentence structure improvement",
      "Professional writing enhancement",
      "Academic writing support",
      "Readability optimization",
      "Preserve writing style",
      "Free unlimited use"
    ],
    rating: {
      value: "4.9",
      count: "1350"
    }
  }

  const faqs = [
    {
      question: "How does the AI text improver work?",
      answer: "Our AI text improver uses Claude Haiku 4.5 to enhance your written content. It improves clarity, fixes grammar and punctuation errors, enhances sentence structures, and makes your writing more professional while preserving your core message."
    },
    {
      question: "Can it help with academic writing?",
      answer: "Yes! Perfect for academic writing, research papers, and essays. It enhances clarity while maintaining academic standards and formal tone appropriate for scholarly work."
    },
    {
      question: "Does it change my writing style?",
      answer: "No, it enhances your writing while preserving your unique voice. The AI improves clarity, grammar, and readability without completely rewriting in a different style."
    },
    {
      question: "Is it free to use?",
      answer: "Yes! Our AI text improver is completely free with no payment required. No signup, no subscription, unlimited access to all features."
    },
    {
      question: "What types of errors does it fix?",
      answer: "It fixes punctuation errors, grammar mistakes, spelling issues, improves sentence structures, enhances logical flow, and increases overall quality and readability of your text."
    },
    {
      question: "Can I use it for professional content?",
      answer: "Absolutely! Perfect for professional content, business documents, emails, and articles. It helps create error-free, engaging content for your target audience."
    }
  ]

  const handleImprove = async (text) => {
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to improve text')
    }

    return data.improved
  }

  return (
    <>
      <FAQSchema faqs={faqs} />
      <SoftwareApplicationSchema tool={toolInfo} />
      <ToolLayout
        title="Enhance Your Writing: The Best AI Text Improver for Clearer Content"
        description="Free AI text improver for enhancing written content with advanced AI. Improve clarity, rewrite paragraphs, fix punctuation errors. Perfect for academic writing and professional content creation."
        currentPath="/ai-text-improver"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Text Improver"
          placeholder="Paste your text here to improve it..."
          actionLabel="Improve Text"
          onTransform={handleImprove}
          showToast={showToast}
          loadingText="Improving your text..."
          demoText="i think that we should maybe consider doing the project differently because the current way isnt working good"
        />

        {/* Introduction Hero with Gradient */}
        <div className="relative isolate mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 px-6 py-16 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <Badge color="purple">Free AI</Badge>
              <Badge color="blue">Advanced AI</Badge>
              <Badge color="cyan">Enhance Writing</Badge>
            </div>
            
            <Heading level={2} className="mb-6 text-3xl font-bold">
              Introduction to AI Text Improvement
            </Heading>
            
            <Text className="mb-6 text-lg text-zinc-700 dark:text-zinc-300">
              Discover the power of AI in enhancing your written content with advanced AI. Learn how advanced AI can inspire and enhance creativity in your writing. Improve clarity and coherence in your writing using an AI text enhancer. Explore the benefits of AI tools in rewriting paragraphs and refining your writing style.
            </Text>
            
            <Text className="mb-8 text-lg text-zinc-700 dark:text-zinc-300">
              Understand how AI can assist in academic writing and professional content creation. AI text improvers can be used to enhance various types of articles, including academic papers, blog posts, and professional publications. Transform your input text into error-free, engaging content.
            </Text>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <SparklesIcon className="h-6 w-6 flex-none text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">AI Powered</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Advanced AI</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <BoltIcon className="h-6 w-6 flex-none text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Lightning Fast</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">1-3 seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <LightBulbIcon className="h-6 w-6 flex-none text-cyan-600 dark:text-cyan-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Improve Clarity</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Better readability</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <CheckCircleIcon className="h-6 w-6 flex-none text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Error Free</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">High quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools - AI Powered & Basic Tools */}
        <RelatedTools currentPath="/ai-text-improver" />

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Before & After Examples</Heading>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "i think that we should maybe consider doing the project differently because the current way isnt working good"
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "I believe we should reconsider our approach to this project, as the current method isn't yielding optimal results."
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Thanks for your email I will get back to you soon about this"
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Thank you for your email. I will respond to your inquiry shortly."
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} className="mb-4 text-3xl font-bold">Benefits of AI Text Improvement</Heading>
            <Text className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
              AI text improvement tools help enhance the logical flow of your writing. They assist in identifying and correcting punctuation mistakes, grammar errors, and spelling issues. Create professional content that engages your target audience and conveys your message effectively.
            </Text>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 transition-all hover:shadow-lg dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
                <LightBulbIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Improve Clarity</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Enhance the logical flow and coherence of your writing. Improved clarity leads to better readability and understanding of your written content.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 transition-all hover:shadow-lg dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Error Free Writing</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Fix punctuation errors, grammar mistakes, and spelling issues. Ensure error-free writing with spell check and grammar tools built-in.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-6 transition-all hover:shadow-lg dark:from-cyan-900/20 dark:to-teal-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-cyan-100 p-3 dark:bg-cyan-900/50">
                <DocumentTextIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Professional Content</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Create professional content that engages your target audience. Perfect for academic writing, business documents, and articles.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-green-50 p-6 transition-all hover:shadow-lg dark:from-teal-900/20 dark:to-green-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-teal-100 p-3 dark:bg-teal-900/50">
                <PencilSquareIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Rewrite Paragraphs</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Easily rewrite paragraphs and enhance sentence structures. Transform your original text while preserving the core message and meaning.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 transition-all hover:shadow-lg dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
                <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Academic & Creative</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Perfect for academic writing, creative writing, and research papers. Enhance creativity while maintaining academic standards.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 p-6 transition-all hover:shadow-lg dark:from-emerald-900/20 dark:to-lime-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/50">
                <BoltIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Save Time</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Streamline the editing process and save time. Get instant suggestions to enhance overall quality and readability of your text.
              </Text>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16">
          <Heading level={2} className="mb-6">Perfect For</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Emails</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Make professional emails clear and polished
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Reports</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enhance business reports and documents
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💬 Messages</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Improve clarity in chat and messages
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Content</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Polish blog posts and articles
              </p>
            </div>
          </div>
        </div>

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Is my text data safe?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Your text is processed securely through our API and is not stored or used for training. We use enterprise-grade encryption.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How fast is the AI processing?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                We use Claude Haiku 4.5, which is 2x faster than other AI models. Most texts are improved in 1-3 seconds.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Will it change the meaning of my text?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                No! The AI preserves your original meaning and message. It only improves clarity, grammar, and flow.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
