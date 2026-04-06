import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { cn } from '../lib/utils.ts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [stats, setStats] = useState({
    total: 0,
    cleaned: 0,
    found: 0,
    sent: 0,
    health: { active: 0, paused: 0, draft: 0 },
    channels: {} as Record<string, number>,
    campaignPerformance: [] as any[]
  });

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.uid);
      
      if (!leadsError && leads) {
        let cleaned = 0, found = 0, sent = 0;
        const channels: Record<string, number> = {};
        
        leads.forEach(lead => {
          if (lead.is_cleaned) cleaned++;
          if (lead.is_email_found) found++;
          if (lead.is_email_sent) sent++;
          
          const source = lead.source || 'Unknown';
          channels[source] = (channels[source] || 0) + 1;
        });

        setStats(prev => ({ 
          ...prev, 
          total: leads.length, 
          cleaned, 
          found, 
          sent,
          channels 
        }));
      }

      // Fetch campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('status, title, stats')
        .eq('user_id', user.uid);
      
      if (!campaignsError && campaigns) {
        let active = 0, paused = 0, draft = 0;
        const performance = campaigns.map(c => ({
          name: c.title,
          sent: c.stats?.sent || 0,
          opened: c.stats?.opened || 0,
          clicked: c.stats?.clicked || 0,
          replies: c.stats?.replies || 0
        })).slice(0, 5); // Top 5 for chart

        campaigns.forEach(c => {
          if (c.status === 'Active') active++;
          else if (c.status === 'Paused') paused++;
          else draft++;
        });
        setStats(prev => ({ 
          ...prev, 
          health: { active, paused, draft },
          campaignPerformance: performance
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;
    const leadsSub = supabase
      .channel('analytics_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.uid}` }, fetchData)
      .subscribe();

    const campaignsSub = supabase
      .channel('analytics_campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `user_id=eq.${user.uid}` }, fetchData)
      .subscribe();

    return () => {
      leadsSub.unsubscribe();
      campaignsSub.unsubscribe();
    };
  }, [user, fetchData]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const centerX = width / 2;
    const centerY = height / 2;

    // Data for orbital visualization
    const data = [
      { id: 1, label: "Leads Uploaded", count: stats.total, radius: 100, speed: 0.02, color: "#3b82f6" },
      { id: 2, label: "AI Cleaned", count: stats.cleaned, radius: 150, speed: 0.015, color: "#8b5cf6" },
      { id: 3, label: "Email Found", count: stats.found, radius: 200, speed: 0.01, color: "#10b981" },
      { id: 4, label: "Email Sent", count: stats.sent, radius: 250, speed: 0.008, color: "#f59e0b" },
    ];

    // Draw orbits
    svg.selectAll(".orbit")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "orbit")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", d => d.radius)
      .attr("fill", "none")
      .attr("stroke", theme === 'dark' ? "#334155" : "#cbd5e1")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Draw nodes
    const nodes = svg.selectAll(".node")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "node");

    nodes.append("circle")
      .attr("r", 12)
      .attr("fill", d => d.color)
      .attr("filter", "drop-shadow(0 0 8px rgba(0,0,0,0.1))");

    nodes.append("text")
      .text(d => `${d.label} (${d.count})`)
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", theme === 'dark' ? "#94a3b8" : "#64748b");

    // Animation loop
    let angle = 0;
    const animate = () => {
      angle += 0.01;
      nodes.attr("transform", d => {
        const x = centerX + d.radius * Math.cos(angle * d.speed * 100);
        const y = centerY + d.radius * Math.sin(angle * d.speed * 100);
        return `translate(${x}, ${y})`;
      });
      requestAnimationFrame(animate);
    };

    animate();

    // Center point
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 40)
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.1);
    
    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-weight", "bold")
      .attr("fill", "#3b82f6")
      .text("PIPELINE");

  }, [stats, theme]);

  const totalCampaigns = stats.health.active + stats.health.paused + stats.health.draft;
  const healthData = [
    { label: "Active", value: totalCampaigns > 0 ? Math.round((stats.health.active / totalCampaigns) * 100) : 0, color: "bg-blue-500" },
    { label: "Paused", value: totalCampaigns > 0 ? Math.round((stats.health.paused / totalCampaigns) * 100) : 0, color: "bg-amber-500" },
    { label: "Draft", value: totalCampaigns > 0 ? Math.round((stats.health.draft / totalCampaigns) * 100) : 0, color: "bg-slate-400" }
  ];

  const channelData = Object.entries(stats.channels)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const chartColors = theme === 'dark' ? {
    text: '#94a3b8',
    grid: '#334155',
    sent: '#3b82f6',
    opened: '#8b5cf6',
    clicked: '#10b981'
  } : {
    text: '#64748b',
    grid: '#e2e8f0',
    sent: '#3b82f6',
    opened: '#8b5cf6',
    clicked: '#10b981'
  };

  return (
    <div className="flex flex-col gap-8 p-2 pb-24 md:pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 neumorph rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[600px]">
          <h3 className="text-2xl font-display font-bold mb-8 self-start text-slate-800 dark:text-slate-200">Orbital Pipeline Timeline</h3>
          <svg ref={svgRef} className="w-full max-w-[800px] h-auto" />
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="neumorph rounded-[2.5rem] p-8">
            <h4 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Pipeline Health</h4>
            <div className="space-y-4">
              {healthData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={cn("h-full", item.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="neumorph rounded-[2.5rem] p-8 flex-1">
            <h4 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Top Channels</h4>
            <div className="space-y-6">
              {channelData.length > 0 ? channelData.map(([name, count], i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{name}</span>
                  <div className="neumorph-sm px-3 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400">
                    {count}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4">No channel data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neumorph rounded-[2.5rem] p-8 min-h-[400px]">
          <h3 className="text-xl font-display font-bold mb-8 text-slate-800 dark:text-slate-200">Campaign Engagement</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={chartColors.text} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke={chartColors.text} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    border: 'none',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="sent" fill={chartColors.sent} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="opened" fill={chartColors.opened} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="clicked" fill={chartColors.clicked} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neumorph rounded-[2.5rem] p-8 min-h-[400px]">
          <h3 className="text-xl font-display font-bold mb-8 text-slate-800 dark:text-slate-200">Conversion Funnel</h3>
          <div className="flex flex-col justify-center h-full gap-6 pb-8">
            {[
              { label: "Total Sent", value: stats.campaignPerformance.reduce((acc, curr) => acc + curr.sent, 0), color: "text-blue-500" },
              { label: "Total Opened", value: stats.campaignPerformance.reduce((acc, curr) => acc + curr.opened, 0), color: "text-purple-500" },
              { label: "Total Clicked", value: stats.campaignPerformance.reduce((acc, curr) => acc + curr.clicked, 0), color: "text-emerald-500" },
              { label: "Total Replies", value: stats.campaignPerformance.reduce((acc, curr) => acc + curr.replies, 0), color: "text-amber-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 neumorph-sm rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full", item.color.replace('text', 'bg'))} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
