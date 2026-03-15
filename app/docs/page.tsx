"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Book, Key, Code, Globe, ArrowRight, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
}

const endpoints: { category: string; items: Endpoint[] }[] = [
  {
    category: "Companies",
    items: [
      {
        method: "GET",
        path: "/api/v1/companies",
        description: "List verified companies with pagination and optional filters.",
        auth: "API Key (companies:read)",
        params: [
          { name: "setor", type: "string", required: false, description: "Filter by sector" },
          { name: "pais", type: "string", required: false, description: "Filter by country" },
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
        ],
        response: `{
  "companies": [
    {
      "slug": "acme-corp",
      "nome": "Acme Corp",
      "setor": "Tecnologia",
      "pais": "Portugal",
      "estagio": "growth",
      "verificada": true,
      "descricao": "...",
      "criadoEm": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}`,
      },
    ],
  },
  {
    category: "Opportunities",
    items: [
      {
        method: "GET",
        path: "/api/v1/opportunities",
        description: "List active opportunities with pagination and optional filters.",
        auth: "API Key (opportunities:read)",
        params: [
          { name: "tipo", type: "string", required: false, description: "Filter by type (franquia, investimento, parceria, fornecedor, expansao)" },
          { name: "setor", type: "string", required: false, description: "Filter by sector" },
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
        ],
        response: `{
  "opportunities": [
    {
      "id": "clx...",
      "titulo": "Franchise expansion — Lisbon",
      "tipo": "franquia",
      "setor": "Food & Beverage",
      "descricao": "...",
      "budget": "50000-100000",
      "company": { "slug": "acme-corp", "nome": "Acme Corp" },
      "criadoEm": "2025-02-01T14:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}`,
      },
      {
        method: "POST",
        path: "/api/v1/opportunities",
        description: "Create a new opportunity (requires write scope).",
        auth: "API Key (opportunities:write)",
        params: [
          { name: "titulo", type: "string", required: true, description: "Title (3-200 chars)" },
          { name: "tipo", type: "string", required: true, description: "Type: franquia, investimento, parceria, fornecedor, expansao" },
          { name: "setor", type: "string", required: true, description: "Sector" },
          { name: "descricao", type: "string", required: true, description: "Description" },
          { name: "budget", type: "string", required: false, description: "Budget range" },
          { name: "requisitos", type: "string", required: false, description: "Requirements" },
        ],
        response: `{
  "opportunity": {
    "id": "clx...",
    "titulo": "...",
    "tipo": "parceria",
    "status": "ativa"
  }
}`,
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-all"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-300" />}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${methodColors[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-gray-700 flex-1">{endpoint.path}</code>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">{endpoint.description}</p>

          <div className="flex items-center gap-2 text-xs">
            <Key className="w-3 h-3 text-gray-400" />
            <span className="text-gray-500">Auth:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{endpoint.auth}</code>
          </div>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Parameters</p>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Required</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((p) => (
                      <tr key={p.name} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2 font-mono text-gray-800">{p.name}</td>
                        <td className="px-3 py-2 text-gray-500">{p.type}</td>
                        <td className="px-3 py-2">
                          {p.required ? (
                            <span className="text-amber-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoint.response && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Response</p>
              <CodeBlock code={endpoint.response} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="text-[#0B1D32]" size={22} />
            <span className="text-xs font-medium text-gray-400">API Docs</span>
          </Link>
          <Link
            href="/dashboard/api"
            className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500"
          >
            <Key className="w-3.5 h-3.5" />
            Manage API Keys
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Reference</h1>
              <p className="text-sm text-gray-500">Grupo +351 Public API v1</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Access company and opportunity data programmatically. All endpoints require authentication
            via API key passed in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
          </p>
        </div>

        {/* Quick start */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-gray-400" />
            Quick Start
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Get API Key", desc: "Create a key in Dashboard > API with the scopes you need." },
              { step: "2", title: "Authenticate", desc: "Pass your key in the Authorization: Bearer header." },
              { step: "3", title: "Make requests", desc: "Call endpoints at https://grupo351.com/api/v1/..." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-700 mb-3">
                  {step}
                </div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <CodeBlock
            code={`curl -H "Authorization: Bearer pk351_your_key_here" \\
  https://grupo351.com/api/v1/companies?limit=5`}
          />
        </div>

        {/* Auth section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" />
            Authentication
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <p className="text-sm text-gray-600">
              All requests must include a valid API key in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Authorization</code> header:
            </p>
            <CodeBlock code={`Authorization: Bearer pk351_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
            <p className="text-xs text-gray-500">
              API keys are scoped — each key only has access to the permissions granted at creation.
              Keys are available on the <strong>Enterprise</strong> plan.
            </p>
          </div>
        </div>

        {/* Rate limits */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" />
            Rate Limits
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Rate limit</p>
                <p className="font-medium text-gray-900">100 requests / minute</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Response format</p>
                <p className="font-medium text-gray-900">JSON</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Exceeding limits returns <code className="bg-gray-100 px-1 rounded">429 Too Many Requests</code>.
            </p>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-gray-400" />
            Endpoints
          </h2>

          {endpoints.map(({ category, items }) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">{category}</h3>
              <div className="space-y-2">
                {items.map((ep) => (
                  <EndpointCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Error codes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Error Codes</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs">Code</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "400", meaning: "Bad Request — Invalid parameters" },
                  { code: "401", meaning: "Unauthorized — Missing or invalid API key" },
                  { code: "403", meaning: "Forbidden — Insufficient scope" },
                  { code: "404", meaning: "Not Found" },
                  { code: "429", meaning: "Too Many Requests — Rate limited" },
                  { code: "500", meaning: "Internal Server Error" },
                ].map(({ code, meaning }) => (
                  <tr key={code} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{code}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Grupo +351 API v1 — Need help?{" "}
            <Link href="/contato" className="text-amber-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
