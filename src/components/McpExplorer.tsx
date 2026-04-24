import React, { useState, useEffect } from 'react';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Boxes, Play, Terminal, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

export default function McpExplorer({ token }: { token: string | null }) {
  const [tools, setTools] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('disconnected');
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    let activeClient: Client;
    let transport: SSEClientTransport;

    const connectMcp = async () => {
      try {
        setStatus('connecting');
        activeClient = new Client({
          name: "MCP UI Explorer",
          version: "1.0.0"
        }, {
          capabilities: {}
        });

        // Use absolute URL or relative URL based on window.location
        const url = new URL("/mcp/sse", window.location.href);
        transport = new SSEClientTransport(url);
        
        await activeClient.connect(transport);
        setClient(activeClient);
        setStatus('connected');

        try {
          const toolsRes = await activeClient.listTools();
          setTools(toolsRes.tools || []);
        } catch (e) {}

        try {
          const resourcesRes = await activeClient.listResources();
          setResources(resourcesRes.resources || []);
        } catch (e) {}

        try {
          const promptsRes = await activeClient.listPrompts();
          setPrompts(promptsRes.prompts || []);
        } catch (e) {}

      } catch (err) {
        console.error("MCP Connection error:", err);
        setStatus('error');
      }
    };

    connectMcp();

    return () => {
      if (transport) {
        transport.close();
      }
    };
  }, [token]);

  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2 border border-indigo-100">
            MODEL CONTEXT PROTOCOL
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
            MCP Explorer
            <span className="text-slate-300 font-light">|</span>
            <span className="text-base font-medium text-slate-500">API Capabilities</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${status === 'connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : status === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : status === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></div>
            {status.toUpperCase()}
          </div>
        </div>
      </div>

      {status === 'connected' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Available Tools</h3>
                <p className="text-xs text-slate-500">Functions exposed to the LLM agent</p>
              </div>
            </div>
            <div className="p-0">
              {tools.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No tools available</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tools.map((tool, i) => (
                    <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">{tool.name}</div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{tool.description}</p>
                      
                      {tool.inputSchema && (
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Input Schema</div>
                          <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                            {JSON.stringify(tool.inputSchema, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Boxes size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Resources</h3>
                  <p className="text-xs text-slate-500">Data sources exposed to the LLM</p>
                </div>
              </div>
              <div className="p-4">
                {resources.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No resources mapping found</div>
                ) : (
                  <ul className="space-y-4">
                    {resources.map((r, i) => (
                      <li key={i} className="p-4 bg-slate-50 rounded-xl">
                         <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                         <div className="text-xs text-slate-500 font-mono mt-1">{r.uri}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Prompts</h3>
                  <p className="text-xs text-slate-500">Template prompts for the interaction</p>
                </div>
              </div>
              <div className="p-4">
                {prompts.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No prompts found</div>
                ) : (
                  <ul className="space-y-4">
                    {prompts.map((p, i) => (
                      <li key={i} className="p-4 bg-slate-50 rounded-xl">
                         <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                         <div className="text-xs text-slate-500 mt-1">{p.description}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
