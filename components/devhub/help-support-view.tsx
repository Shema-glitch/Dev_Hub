'use client'

import { useState } from 'react'
import {
  BookOpen,
  Lifebuoy,
  ChatCircleText,
  EnvelopeSimple,
  ArrowSquareOut,
  Keyboard,
  MagnifyingGlass,
  CaretDown,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function HelpSupportView() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const resources = [
    {
      title: 'Documentation',
      description: 'Read the comprehensive guides on how to use Dev Hub.',
      icon: BookOpen,
      link: '#',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Speed up your workflow with hotkeys.',
      icon: Keyboard,
      link: '#',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Community Forum',
      description: 'Ask questions and share tips with other developers.',
      icon: ChatCircleText,
      link: '#',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Contact Support',
      description: 'Get direct help from our support team.',
      icon: EnvelopeSimple,
      link: '#',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ]

  const faqs = [
    {
      q: 'How does the Context Engine work?',
      a: 'The Context Engine automatically tracks the files you modify and the terminal commands you run during an active session, feeding them into the LLM context.'
    },
    {
      q: 'Can I sync projects with a private GitHub repo?',
      a: 'Yes, as long as you authenticate with a GitHub account that has access to the private repository, Dev Hub can sync and manage those issues.'
    },
    {
      q: 'Where is my data stored?',
      a: 'All session logs, intents, and tracked code changes are currently stored locally in your browser storage. Future updates will introduce secure cloud syncing.'
    },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Premium Header Background */}
      <div className="relative w-full h-[280px] shrink-0 border-b border-zinc-800/50 bg-zinc-900/50 overflow-hidden flex flex-col items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl w-full px-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-amber-500/10 mb-2">
            <Lifebuoy className="h-8 w-8 text-amber-500" weight="duotone" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
            How can we help you?
          </h1>
          
          {/* Search Bar */}
          <div className="relative group mx-auto w-full max-w-lg">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 shadow-lg focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
              <MagnifyingGlass className="h-5 w-5 text-zinc-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search documentation, guides, and FAQs..."
                className="w-full bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-5xl mx-auto w-full space-y-16 mt-4 pb-20">
        
        {/* Resources Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-200 px-1">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, i) => (
              <a
                key={i}
                href={resource.link}
                className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden transition-all duration-300 hover:bg-zinc-900/80 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl transition-colors duration-300", resource.bg, resource.color)}>
                    <resource.icon className="h-6 w-6" weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-zinc-200 group-hover:text-white transition-colors">{resource.title}</h3>
                  </div>
                  <ArrowSquareOut className="h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-amber-500 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" weight="duotone" />
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{resource.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-200 px-1">Frequently Asked Questions</h2>
          <div className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-zinc-800/50 last:border-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className={cn("font-medium transition-colors", isOpen ? "text-amber-400" : "text-zinc-300")}>{faq.q}</span>
                    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 transition-transform duration-300", isOpen && "rotate-180")}>
                      <CaretDown className={cn("h-3.5 w-3.5", isOpen ? "text-amber-400" : "text-zinc-400")} weight="bold" />
                    </div>
                  </button>
                  <div className={cn("overflow-hidden transition-all duration-300 ease-in-out px-5", isOpen ? "max-h-[200px] opacity-100 pb-5" : "max-h-0 opacity-0")}>
                    <p className="text-sm text-zinc-400 leading-relaxed pr-8">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 flex items-start gap-4">
            <div className="p-2 rounded-full bg-emerald-500/10 shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" weight="duotone" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-1">System Status</h4>
              <p className="text-xs text-zinc-400 mb-3">All services and backend integrations are fully operational.</p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                100% Uptime
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4 justify-between group cursor-pointer hover:bg-amber-500/10 transition-colors">
            <div>
               <h4 className="text-sm font-semibold text-amber-400 mb-1">Priority Support</h4>
               <p className="text-xs text-zinc-400">Need immediate assistance? Our engineering team is on standby.</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
              <Lightning className="h-5 w-5" weight="fill" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
